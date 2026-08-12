import { Mode,modeSchema } from '@nightcode/shared';
import {z} from 'zod';

export const newSessionStateSchema = z.object({
    message: z.string(),
    mode: modeSchema,
    model: z.string()
})