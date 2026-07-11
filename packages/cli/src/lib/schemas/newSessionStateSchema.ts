import {z} from 'zod';

export const newSessionStateSchema = z.object({
    message: z.string()
})