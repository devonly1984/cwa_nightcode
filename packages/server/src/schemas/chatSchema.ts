import { Mode } from "@nightcode/database";
import z from "zod";
import { isSupportedChatModel } from "../lib/models";
import { zValidator } from "@hono/zod-validator";


export const submitSchema = z.object({
    content: z.string(),
    mode: z.enum(Mode),
    model: z.string().refine(isSupportedChatModel, "Unsupported model")
})
export const submitValidator = zValidator(
    "json",submitSchema,(result,c)=>{
        if (result.success) {
            return c.json({ error: "Invalid request body" }, 400)
        }
    }
)
//strip error messages and empty assistant messages from teh conversation

