import { chromium, Page } from "playwright";
import moment from "moment";
import { appendTitleToCsv, initializeCsv } from "./utils/writeToCsv";
import { normalizeListing } from "./utils/normalize";
import "dotenv/config";
import { promises as fs } from "fs";
import * as path from "path";

// Configuration
const TARGET_URL = process.env.TARGET_URL || "https://www.imot.bg/search/prodazhbi/grad-sofiya";
const TODAY = moment().format("YYYY-MM-DD");

// Here we fill in the form with the search criteria mapping
const imotBgFields = require("../imot-bg-fields.json");

export type SearchCriteria = {
  property_type: string;
  area_sqm: { min: string; max: string };
  price: { min: string; max: string };
  sort_order: string; // matches site select values
  keywords: string[];
  regions: string[];
  duration?:
    | "today"
    | "yesterday"
    | "last2h"
    | "last6h"
    | "last24h"
    | "last48h";
};

export type CrawlerOptions = {
  headless?: boolean;
  saveCsv?: boolean; // default false; if true, also append CSV
};

export async function runCrawler(
  searchCriteria: SearchCriteria,
  options: CrawlerOptions = {}
) {
  try {
    const results: Array<{
      title: string;
      price: string;
      location: string;
      date: string;
      link: string;
      imgLink: string;
      description: string;
    }> = [];

    // Launch browser
    const browser = await chromium.launch({
      headless: options.headless ?? true,
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to target URL
    await page.goto(TARGET_URL);

    // Wait for listings to load
    await page.waitForSelector("#cookiescript_accept");
    await page.click("#cookiescript_accept");

    await setUpListingCriteria(page, searchCriteria);

    //click on search button
    const searchButton = await page.$(`input[value="Т Ъ Р С И"]`);
    if (searchButton) {
      await searchButton.click();
    }
    await page.waitForTimeout(2000); // waits 2 seconds which should be enough for the page with results to load

    //for each page of the pages

    const totalPagesSelector = await page.$$(
      ".pagination a.saveSlink:not(.next):not(.prev)"
    );
    const totalPages = new Array(...totalPagesSelector).slice(
      totalPagesSelector.length / 2
    );
    console.log("Total pages: ", totalPages.length + 1);
    const totalPagesCount = totalPages.length;

    // initialize CSV only if enabled
    const saveCsv = options.saveCsv === true;
    if (saveCsv) {
      await initializeCsv();
    }

    let i = 0;
    do {
      console.log("Processing page: ", i + 1);
      await processListings(page, searchCriteria, results, saveCsv);
      await navigateToPage(page, i);
      await page.waitForTimeout(500); // waits 0.5 seconds which should be enough for the page with results to load
      i++;
    } while (i < totalPagesCount);

    await page.close();
    await context.close();
    await browser.close();

    // Write JSON results file
    const jsonPath = path.join(__dirname, "..", "..", "recent_ads.json");
    await fs.writeFile(jsonPath, JSON.stringify(results, null, 2), "utf8");
    console.log(
      `Finished processing all pages. Found ${results.length} listings.`
    );

    return results;
  } catch (error) {
    console.error("Error in main:", error);
    throw error;
  }
}

async function setUpListingCriteria(
  page: Page,
  searchCriteria: SearchCriteria
) {
  try {
    //Fill in the form

    //set up inputs for square meters
    const squareMetersInputMin = await page.$(
      `input[name=${imotBgFields.square_meters.low_limit}]`
    );
    if (squareMetersInputMin) {
      await squareMetersInputMin.fill(searchCriteria.area_sqm.min);
    }
    const squareMetersInputMax = await page.$(
      `input[name=${imotBgFields.square_meters.upper_limit}]`
    );
    if (squareMetersInputMax) {
      await squareMetersInputMax.fill(searchCriteria.area_sqm.max);
    }

    //set up inputs for price
    const priceInputMin = await page.$(
      `input[name=${imotBgFields.price.low_limit}]`
    );
    if (priceInputMin) {
      await priceInputMin.fill(searchCriteria.price.min);
    }
    const priceInputMax = await page.$(
      `input[name=${imotBgFields.price.upper_limit}]`
    );
    if (priceInputMax) {
      await priceInputMax.fill(searchCriteria.price.max);
    }

    //set up inputs for keywords
    const keywordsInput = await page.$(
      `input[name=${imotBgFields.searched_keyword}]`
    );
    if (keywordsInput) {
      await keywordsInput.fill(searchCriteria.keywords.join(","));
    }

    //set up inputs for regions
    await selectRegions(page, searchCriteria);

    //set up sorting
    const sortingInput = await page.$(
      `select[name=${imotBgFields.sort_order}]`
    );
    if (sortingInput) {
      await sortingInput.selectOption(searchCriteria.sort_order);
    }
  } catch (error) {
    console.error("Error in setUpListingCriteria:", error);
  }
}

async function selectRegions(page: Page, searchCriteria: SearchCriteria) {
  try {
    const regionsTargetInput = await page.$(
      `select[name=${imotBgFields.regions_to_search_for}]`
    );
    if (regionsTargetInput) {
      //create options html elements for all regions and append them to the select element
      await Promise.all(
        searchCriteria.regions.map(async (region: string) => {
          await page.evaluate((region) => {
            const option = document.createElement("option");
            option.value = region;
            option.textContent = region;
            document.querySelector("select[name='rs']")?.appendChild(option);
          }, region);
        })
      );
    }
  } catch (error) {
    console.error("Error in selectRegions:", error);
  }
}

async function processListings(
  page: Page,
  searchCriteria: SearchCriteria,
  results: Array<{
    title: string;
    price: string;
    location: string;
    date: string;
    link: string;
    imgLink: string;
    description: string;
  }>,
  saveCsv: boolean
) {
  try {
    console.log("Processing listings");
    const handles = await page.$$(".ads2023 .zaglavie a.title.saveSlink");
    const listingUrls = await Promise.all(
      handles.map(async (el) => {
        const url = (await el.getAttribute("href"))?.toString().slice(2);
        return `http://${url}`;
      })
    );

    if (!listingUrls || listingUrls.length === 0) {
      console.log("No listing URLs found on the page.");
      return;
    }

    console.log(`Found ${listingUrls.length} listing URLs on the page.`);

    // Process each listing URL sequentially
    for (let i = 0; i < listingUrls.length; i++) {
      try {
        const url = listingUrls[i];
        if (!url) {
          console.log(`Listing ${i + 1} has no valid URL, skipping...`);
          continue;
        }

        console.log(
          `Processing listing ${i + 1}/${listingUrls.length}: ${url}`
        );

        // Navigate directly to the listing URL
        await page.goto(url);

        const listing = await checkListingInfo(
          page,
          searchCriteria.duration,
          saveCsv
        );
        if (listing) {
          results.push(normalizeListing(listing));
        }

        // Wait 2 seconds on the listing page
        await page.waitForTimeout(2000);

        console.log(`Completed processing listing ${i + 1}`);
      } catch (error) {
        console.error(`Error processing listing ${i + 1}:`, error);
        // Try to go back if we're stuck on a listing page
        try {
          await page.goBack();
          await page.waitForTimeout(1000);
        } catch (backError) {
          console.error("Failed to go back:", backError);
        }
      }
    }

    console.log("Finished processing all listings.");
  } catch (error) {
    console.error("Error in processListings:", error);
  }
}

// Extract all listing info needed for result and write it
async function extractAndWriteListing(page: Page, saveCsv: boolean) {
  try {
    //expand the description if it can
    const seeMoreBtn = await page.$("a#dots_link_more");
    if (seeMoreBtn) {
      await seeMoreBtn.click();
    }

    const titleEls = await page.$$("h1.obTitle");
    const dateEls = await page.$$(".adPrice .info div");
    const priceEls = await page.$$(".Price");
    const locationEls = await page.$$(".advHeader .info .location");
    const descriptionEls = await page.$$("#description_div");

    const title =
      (titleEls[0] ? await titleEls[0].textContent() : "")
        ?.trim()
        .replace("\n", "")
        .replace("\t", "")
        .replace("\r", "") || "";
    const dateText = dateEls[0] ? (await dateEls[0].textContent()) || "" : "";
    const price = priceEls[0] ? (await priceEls[0].textContent()) || "" : "";
    const location = locationEls[0]
      ? (await locationEls[0].textContent()) || ""
      : "";
    const description = descriptionEls[0]
      ? ((await descriptionEls[0].textContent()) || "").trim()
      : "";

    // Try to get an image via og:image meta if present
    const ogImg =
      (await page.getAttribute('meta[property="og:image"]', "content")) || "";

    const listing = {
      title,
      price,
      location,
      date: dateText,
      link: page.url(),
      imgLink: ogImg,
      description,
    };

    if (saveCsv) {
      await appendTitleToCsv(
        normalizeListing(listing, { includeEurSuffix: true })
      );
      console.log(`Title written to CSV: ${title}`);
    }

    return normalizeListing(listing);
  } catch (err) {
    console.error("Error extracting/writing listing info:", err);
    return null;
  }
}

async function checkListingInfo(
  page: Page,
  duration: SearchCriteria["duration"] | undefined,
  saveCsv: boolean
) {
  try {
    console.log("Checking listing info");
    const dateEls = await page.$$(".adPrice .info div");
    const dateText = dateEls[0] ? await dateEls[0].textContent() : null;

    let parsedDate: Date | null = null;
    if (dateText) {
      parsedDate = parseBulgarianDateTime(dateText);
    }

    const NOW = new Date();
    if (
      parsedDate &&
      isWithinDuration(parsedDate, NOW, duration ?? "last48h")
    ) {
      return await extractAndWriteListing(page, saveCsv);
    }
  } catch (error) {
    console.error("Error checking listing info:", error);
  }
  return null;
}
// Utility to parse Bulgarian date strings like
// "Коригирана в 16:02 на 15 юли, 2025 год." or "Публикувана на 15 юли, 2025 год."
function parseBulgarianDateTime(dateStr: string): Date | null {
  const timeRegex = /(\d{1,2}):(\d{2})/;
  const dateRegex =
    /(\d{1,2})\s(януари|февруари|март|април|май|юни|юли|август|септември|октомври|ноември|декември),\s(\d{4})/i;
  const dateMatch = dateStr.match(dateRegex);
  if (!dateMatch) return null;
  const day = parseInt(dateMatch[1], 10);
  const monthBg = dateMatch[2].toLowerCase();
  const year = parseInt(dateMatch[3], 10);
  const bgMonths = [
    "януари",
    "февруари",
    "март",
    "април",
    "май",
    "юни",
    "юли",
    "август",
    "септември",
    "октомври",
    "ноември",
    "декември",
  ];
  const month = bgMonths.indexOf(monthBg);
  if (month === -1) return null;
  const timeMatch = dateStr.match(timeRegex);
  const hours = timeMatch ? parseInt(timeMatch[1], 10) : 0;
  const minutes = timeMatch ? parseInt(timeMatch[2], 10) : 0;
  return new Date(year, month, day, hours, minutes, 0, 0);
}

function isWithinDuration(
  date: Date,
  now: Date,
  duration: NonNullable<SearchCriteria["duration"]>
): boolean {
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return false; // future or invalid

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  switch (duration) {
    case "today": {
      const todayStart = startOfDay(now);
      return date >= todayStart;
    }
    case "yesterday": {
      const yesterdayStart = new Date(
        startOfDay(now).getTime() - 24 * 60 * 60 * 1000
      );
      const todayStart = startOfDay(now);
      return date >= yesterdayStart && date < todayStart;
    }
    case "last2h":
      return diffMs <= 2 * 60 * 60 * 1000;
    case "last6h":
      return diffMs <= 6 * 60 * 60 * 1000;
    case "last24h":
      return diffMs <= 24 * 60 * 60 * 1000;
    case "last48h":
    default:
      return diffMs <= 48 * 60 * 60 * 1000;
  }
}

async function navigateToPage(page: Page, pageNumber: number) {
  const totalPagesSelector = await page.$$(
    ".pagination a.saveSlink:not(.next):not(.prev)"
  );
  const totalPages = new Array(...totalPagesSelector).slice(
    totalPagesSelector.length / 2
  );
  // console.log("going to page: ", pageNumber + 2, " of ", totalPages.length + 1);
  const nextPage = totalPages[pageNumber];
  if (nextPage) {
    await nextPage.click();
  }
}
