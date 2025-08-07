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

export async function appendTitleToCsv(adListing: AddListing) {
  const line = `${adListing.title},${adListing.price},${adListing.location},${adListing.date},${adListing.link},${adListing.imgLink},${adListing.description}\n`;
  await fs.appendFile(CSV_PATH, line, "utf8");
}
