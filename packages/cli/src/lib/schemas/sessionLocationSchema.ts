import type { ModeType, SupportedChatModelId } from "@nightcode/shared";
import type { SessionData } from "../../types";
import z from "zod";

export const sessionLocationSchema = z.object({
    session: z.custom<SessionData>((val) => val != null && typeof val === 'object' && "id" in val),
    initialPrompt: z.object({
        message: z.string(),
        mode: z.custom<ModeType>(),
        model: z.custom<SupportedChatModelId>()
    }).optional()
})