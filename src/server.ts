import express, { Request, Response, NextFunction } from "express";
import { runCrawler, SearchCriteria, CrawlerOptions } from "./crawler";
import "dotenv/config";

// Schemas
import { searchCriteriaSchema, optionsSchema } from "./schemas";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// POST /crawl - triggers the crawler with provided criteria
// Example body:
// {
//   "criteria": { ...matches search.json structure... },
//   "options": { "headless": true }
// }
app.post("/crawl", async (req: Request, res: Response) => {
  console.log("Received crawl request:", req.body);
  try {
    const criteriaParsed = searchCriteriaSchema.parse(req.body.criteria);
    const optionsParsed = optionsSchema.parse(req.body.options ?? {});

    // Run synchronously: request will take as long as the crawl runs
    await runCrawler(
      criteriaParsed as SearchCriteria,
      optionsParsed as CrawlerOptions
    );

    res.status(200).json({ message: "Crawl completed", csv: "recent_ads.csv" });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return res
        .status(400)
        .json({ error: "Invalid request body", details: err.issues });
    }
    console.error("/crawl error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Simple error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
