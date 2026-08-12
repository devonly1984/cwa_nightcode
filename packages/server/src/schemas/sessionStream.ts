import { zValidator } from "@hono/zod-validator";
import z from "zod";

export const createSessionSchema = z.object({
  title: z.string(),
  
});
export const createSessionValidator = zValidator(
  "json",
  createSessionSchema,
  (result, c) => {
    if (!result.success) {

      return c.json({ error: "Invalid request body" }, 400);
    }
  },
);
