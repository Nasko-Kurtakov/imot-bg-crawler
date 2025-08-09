// Shared normalization utilities for listing data
// - Collapses internal whitespace to single spaces and trims
// - Extracts price part before "EUR" (case-insensitive) and optionally re-appends "EUR"

export type ListingData = {
  title: string;
  price: string;
  location: string;
  date: string;
  link: string;
  imgLink: string;
  description: string;
};

export const normalizeWhitespace = (s: string) => s.replace(/\s+/g, " ").trim();

export const priceBeforeEUR = (price: string) => {
  const idx = price.toUpperCase().indexOf("EUR");
  const before = idx >= 0 ? price.slice(0, idx) : price;
  return before.replace(/\s+/g, "").trim();
};

export function normalizeListing(
  input: ListingData,
  opts: { includeEurSuffix?: boolean } = {}
): ListingData {
  const includeEurSuffix = opts.includeEurSuffix === true;
  const normalizedPriceCore = priceBeforeEUR(input.price);
  const price = includeEurSuffix ? `${normalizedPriceCore}EUR` : normalizedPriceCore;
  return {
    title: normalizeWhitespace(input.title || ""),
    price,
    location: normalizeWhitespace(input.location || ""),
    date: normalizeWhitespace(input.date || ""),
    link: (input.link || "").trim(),
    imgLink: (input.imgLink || "").trim(),
    description: normalizeWhitespace(input.description || ""),
  };
}
