import type { ModeType, ToolContracts } from "@nightcode/shared"
import type { LanguageModelUsage, UIMessage } from "ai";

export type ChatMessageMetadata = {
    mode?:ModeType;
    model?:string;
    durationMs?:number;
    usage?: LanguageModelUsage
}

export type NightcodeUIMessage = UIMessage<ChatMessageMetadata, never, InferUITools<ToolContracts>>

