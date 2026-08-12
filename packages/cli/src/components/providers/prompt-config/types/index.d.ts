import  { type ModeType } from "@nightcode/shared"
import type { SupportedChatModelId } from "@nightcode/shared";


export type PromptConfigContextValue = {
    mode:ModeType;
    toggleMode:()=>void;
    setMode: (mode: ModeType) => void;
    model: SupportedChatModelId;
    setModel: (model: SupportedChatModelId) => void;
}