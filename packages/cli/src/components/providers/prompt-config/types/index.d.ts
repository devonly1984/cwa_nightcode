import type { Mode } from "@nightcode/database/enums"
import type { SupportedChatModelId } from "@nightcode/shared";


export type PromptConfigContextValue = {
    mode:Mode
    toggleMode:()=>void;
    setMode:(mode:Mode)=>void;
    model: SupportedChatModelId;
    setModel: (model: SupportedChatModelId) => void;
}