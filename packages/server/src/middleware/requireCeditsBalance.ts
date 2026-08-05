import {createMiddleware} from 'hono/factory';
import type {AuthenticatedEnv} from './requireAuth';
import {getAvailableCreditsBalance} from '../lib/polar/polar';

export const requiredCreditsBalance = createMiddleware<AuthenticatedEnv>(async(c,next)=>{
    try{
        const userId = c.get("userId")
        const creditsBalance = await getAvailableCreditsBalance(userId);
        
        if (creditsBalance <=0){
            return c.json({ error: "No credits remaining. Run /upgrade to buy more credits" }, 402)
        };
        await next()
    } catch{
        return c.json({ error: "Unable to verify credits balance right now" }, 503)
    }
})