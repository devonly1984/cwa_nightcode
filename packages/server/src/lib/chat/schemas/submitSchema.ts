import {z} from 'zod';
import type { NightcodeUIMessage } from '../types';
import { modeSchema } from '@nightcode/shared';
import { isSupportedChatModel } from '../../models';
import { zValidator } from '@hono/zod-validator';


export const submitSchema = z.object({
    id:z.string(),
    messages: z.array(z.custom<NightcodeUIMessage>((value) => {
        return value != null && typeof value === 'object' && "id" in value && "parts" in value;
    })).min(1),
    mode:modeSchema,
    model: z.string().refine(isSupportedChatModel, "Unsupported Model")
})

export const submitValidator = zValidator('json',submitSchema,(result,c)=>{
    if (!result.success) {
        return c.json({ error: "Invalid request body" }, 400)
    }
})