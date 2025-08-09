import { promises as fs } from "fs";
import * as path from "path";
import { ListingData, normalizeListing } from "./normalize";

export type AddListing = {
  title: string;
  price: string;
  location: string;
  date: string;
  link: string;
  imgLink: string;
  description: string;
};

const CSV_FILENAME = "recent_ads.csv";
const CSV_PATH = path.join(__dirname, "..", "..", CSV_FILENAME);

// Initialize header once on demand instead of at import time
let csvInitialized = false;
export async function initializeCsv() {
  if (!csvInitialized) {
    await fs.writeFile(
      CSV_PATH,
      "title,price,location,date,link,imgLink,description\n",
      "utf8"
    );
    csvInitialized = true;
  }
}

export async function appendTitleToCsv(adListing: AddListing) {
  const normalized: ListingData = normalizeListing(adListing, {
    includeEurSuffix: true,
  });
  const line = `${normalized.title},${normalized.price},${normalized.location},${normalized.date},${normalized.link},${normalized.imgLink},${normalized.description}\n`;
  await fs.appendFile(CSV_PATH, line, "utf8");
}
