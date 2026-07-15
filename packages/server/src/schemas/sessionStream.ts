import { zValidator } from "@hono/zod-validator";
import { Mode, Role, MessageStatus } from "@nightcode/database";
import { findSupportedChatModel } from "@nightcode/shared";
import z from "zod";
import * as Sentry from "@sentry/hono/bun";
export const createSessionSchema = z.object({
  title: z.string(),
  cwd: z.string().optional(),
  initialMessage: z
    .object({
      role: z.enum(Role),
      content: z.string(),
      mode: z.enum(Mode),
      model: z
        .string()
        .refine((id) => !!findSupportedChatModel(id), "Unsupported model"),
    })
    .optional(),
});
export const createSessionValidator = zValidator(
  "json",
  createSessionSchema,
  (result, c) => {
    if (!result.success) {
      Sentry.logger.warn("Session creation validation failed", {
        path: c.req.path,
        issues: result.error.issues.length,
      });
      return c.json({ error: "Invalid request body" }, 400);
    }
  },
);
