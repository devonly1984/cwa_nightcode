import type { SessionData } from "../../types";
import z from "zod";

export const sessionLocationSchema = z.object({
    session: z.custom<SessionData>((val) => val != null && typeof val === 'object' && "id" in val)
})