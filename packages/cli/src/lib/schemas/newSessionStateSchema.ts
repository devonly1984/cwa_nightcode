import { Mode } from '@nightcode/database';
import {z} from 'zod';

export const newSessionStateSchema = z.object({
    message: z.string(),
    mode: z.enum(Mode),
    model: z.string()
})