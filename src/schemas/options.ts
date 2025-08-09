import { z } from "zod";

export const optionsSchema = z.object({
  headless: z.boolean().optional(),
});

export type OptionsInput = z.infer<typeof optionsSchema>;
