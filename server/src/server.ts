import express, { Request, Response, NextFunction } from "express";
import { runCrawler, SearchCriteria, CrawlerOptions } from "./crawler";
import "dotenv/config";
import cors from "cors";
import path from "path";

// Schemas
import { searchCriteriaSchema, optionsSchema } from "./schemas";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(cors());

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
    // CSV output is DISABLED by default for FR9; can be re-enabled via options if needed
    const results = await runCrawler(
      criteriaParsed as SearchCriteria,
      { headless: optionsParsed.headless ?? true, saveCsv: false } as CrawlerOptions
    );

    // Return JSON results (also saved to recent_ads.json by the crawler)
    res.status(200).json({ message: "Crawl completed", count: results.length, results });
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

// ---- Static UI hosting (Angular dist) ----
// Serve the Angular production build so UI and API share the same origin (port 3000)
const uiDist = path.join(__dirname, "..", "..", "crawer-ui", "dist", "crawer-ui", "browser");
app.use(express.static(uiDist));

// SPA fallback: let client-side router handle all non-API routes
app.get("*", (_req: Request, res: Response) => {
  res.sendFile(path.join(uiDist, "index.html"));
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
