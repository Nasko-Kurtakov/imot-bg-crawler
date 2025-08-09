import { z } from "zod";

export const searchCriteriaSchema = z.object({
  property_type: z.string(),
  area_sqm: z.object({ min: z.string(), max: z.string() }),
  price: z.object({ min: z.string(), max: z.string() }),
  sort_order: z.string(),
  keywords: z.array(z.string()).default([]),
  regions: z.array(z.string()).default([]),
});

export type SearchCriteriaInput = z.infer<typeof searchCriteriaSchema>;
