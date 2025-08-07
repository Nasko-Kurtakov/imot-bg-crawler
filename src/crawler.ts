import { chromium, Page } from "playwright";
import moment from "moment";
import { appendTitleToCsv } from "./utils/writeToCsv";
import "dotenv/config";

// Configuration
const TARGET_URL = process.env.TARGET_URL || "https://www.imot.bg";
const TODAY = moment().format("YYYY-MM-DD");

//Here we fill in the form with the search criteria
const searchCriteria = require("../search.json");
const imotBgFields = require("../imot-bg-fields.json");

async function extractListingInfo(listingElement: any) {
  try {
    // Extract listing details
    const title = await listingElement.textContent("h2, .title");
    const price = await listingElement.textContent(".price");
    const location = await listingElement.textContent(".location");
    const date = await listingElement.textContent(".date");

    // Check if listing is new today
    if (date && moment(date).isSame(TODAY, "day")) {
      return {
        title: title.trim(),
        price: price.trim(),
        location: location.trim(),
        date: date.trim(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error extracting listing info:", error);
    return null;
  }
}

async function launch() {
  try {
    // Launch browser
    const browser = await chromium.launch({
      headless: false,
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to target URL
    await page.goto(TARGET_URL);

    // Wait for listings to load
    await page.waitForSelector("#cookiescript_accept");
    await page.click("#cookiescript_accept");

    await setUpListingCriteria(page);

    //click on search button
    const searchButton = await page.$(`input[value="Т Ъ Р С И"]`);
    if (searchButton) {
      await searchButton.click();
    }
    await page.waitForTimeout(5000); // waits 5 seconds which should be enough for the page with results to load

    //process listings
    await processListings(page);

    await page.close();
    await context.close();
    await browser.close();
  } catch (error) {
    console.error("Error in main:", error);
  }
}

async function setUpListingCriteria(page: Page) {
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
    await selectRegions(page);

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

async function selectRegions(page: Page) {
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

async function processListings(page: Page) {
  try {
    // Get all listing URLs upfront to avoid stale element references
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

        // const title = await page.$$("h1.obTitle");

        checkListingInfo(page);

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

// Extract all listing info needed for CSV and write it
async function extractAndWriteListing(page: Page) {
  try {
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

    await appendTitleToCsv({
      title,
      price,
      location,
      date: dateText,
      link: page.url(),
      imgLink: ogImg,
      description,
    });
    console.log(`Title written to CSV: ${title}`);
  } catch (err) {
    console.error("Error extracting/writing listing info:", err);
  }
}

async function checkListingInfo(page: Page) {
  try {
    console.log("Checking listing info");
    const dateEls = await page.$$(".adPrice .info div");
    const dateText = dateEls[0] ? await dateEls[0].textContent() : null;

    let parsedDate: Date | null = null;
    if (dateText) {
      parsedDate = parseBulgarianDate(dateText);
    }

    // Compare with current time; proceed if updated/published within last 2 days
    const NOW = new Date();
    if (parsedDate) {
      const diffMs = NOW.getTime() - parsedDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays <= 2 && diffDays >= 0) {
        await extractAndWriteListing(page);
      }
    }
  } catch (error) {
    console.error("Error checking listing info:", error);
  }
}
// Utility to parse Bulgarian date strings like "Коригирана в 16:02 на 15 юли, 2025 год."
function parseBulgarianDate(dateStr: string): Date | null {
  const regex =
    /(\d{1,2})\s(януари|февруари|март|април|май|юни|юли|август|септември|октомври|ноември|декември),\s(\d{4})/i;
  const match = dateStr.match(regex);
  if (!match) return null;
  const day = parseInt(match[1], 10);
  const monthBg = match[2].toLowerCase();
  const year = parseInt(match[3], 10);
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
  return new Date(year, month, day);
}

// Run the crawler
launch();
