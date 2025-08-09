# 🏠 Playwright Automation: imot.bg Daily Listing Fetcher

## 1. Overview

This project uses **Playwright**, a browser automation tool, to automatically open [imot.bg](https://www.imot.bg), input predefined search criteria (e.g., city, price, property type), and extract all **new real estate listings posted today**.

The automation is intended to run daily and produce a list of fresh listings, saved to a file for personal use or later processing.

---

## 2. Objective

- Automate a daily search on imot.bg
- Input user-defined search filters
- Extract all **listings posted today**
- Save results in a readable format (`JSON` or `CSV`)

---

## 3. Scope

### ✅ In Scope

- Launch Chromium browser using Playwright
- Navigate to imot.bg
- Fill out and submit the search form with user filters
- Scroll/load all result listings
- Extract key data from listings:
  - Title
  - Price
  - Location
  - Date posted
  - Link
- Filter only listings posted **today**
- Export to a `.json` or `.csv` file

### ❌ Out of Scope

- Sending notifications (e.g., email, Telegram)
- Long-term storage or analytics
- Price tracking or historical comparisons

---

## 4. Success Criteria

- ✅ Script runs without crashing
- ✅ Correct search filters are applied
- ✅ Only listings from **today** are included
- ✅ Extracted data contains title, price, location, link, and date
- ✅ Output file is correctly formatted
- ✅ Run completes in under 1 minute (headless)

---

## 5. Functional Requirements

| ID  | Description                                                                  |
| --- | ---------------------------------------------------------------------------- |
| FR1 | Navigate to https://www.imot.bg                                              |
| FR2 | Accept search criteria via config file                                       |
| FR3 | Fill and submit the search form                                              |
| FR4 | Load and scroll through all listings                                         |
| FR5 | Identify and filter listings from **today**                                  |
| FR6 | Extract title, price, location, date, and link                               |
| FR7 | Export listings to a JSON or CSV file                                        |
| FR8 | Create a node js server that accepts a post request with the search criteria |

---

## 6. Non-Functional Requirements

| ID   | Description                                  |
| ---- | -------------------------------------------- |
| NFR1 | Use Playwright for automation                |
| NFR2 | Support headless and headful modes           |
| NFR3 | Cross-platform support (Mac, Windows, Linux) |
| NFR4 | Basic error handling and logging             |
| NFR5 | Easy to run from CLI (e.g., `node fetch.js`) |

---

## 7. Configuration Options

These should be set in a `config.json` file:

```json
{
  "location": "Sofia",
  "propertyType": "Апартамент",
  "minPrice": 50000,
  "maxPrice": 200000,
  "headless": true,
  "outputFormat": "json"
}
```
