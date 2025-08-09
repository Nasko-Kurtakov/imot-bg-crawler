import { promises as fs } from "fs";
import * as path from "path";

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

//clear and write the headers to the csv file
fs.writeFile(CSV_PATH, "title,price,location,date,link,imgLink,description\n");

// Normalize whitespace: collapse multiple spaces/tabs/newlines to a single space and trim
const normalize = (s: string) => s.replace(/\s+/g, " ").trim();

// Extract the part of the price before the literal "EUR" (case-insensitive).
// Also remove internal spaces inside that numeric part.
const priceBeforeEUR = (price: string) => {
  const idx = price.toUpperCase().indexOf("EUR");
  const before = idx >= 0 ? price.slice(0, idx) : price;
  // remove internal whitespace; keep digits, dots, commas as-is except spaces
  return before.replace(/\s+/g, "").trim();
};

export async function appendTitleToCsv(adListing: AddListing) {
  const line = `${normalize(adListing.title)},${priceBeforeEUR(
    adListing.price
  )}EUR,${normalize(adListing.location)},${normalize(
    adListing.date
  )},${normalize(adListing.link)},${normalize(adListing.imgLink)},${normalize(
    adListing.description
  )}\n`;
  await fs.appendFile(CSV_PATH, line, "utf8");
}
