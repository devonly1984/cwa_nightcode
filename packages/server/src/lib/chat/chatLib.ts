
import type { NightcodeUIMessage } from "./types";

export const hasPendingToolCalls = (message: NightcodeUIMessage)=>{
    return message.parts.some((part)=>{
        if (part.type==='dynamic-tool' ||  part.type.startsWith("tool-")) {
            const state = (part as {state?:string}).state;
            return state !=='output-available' && state !=='output-error'
        }
        return false;
    })
}
