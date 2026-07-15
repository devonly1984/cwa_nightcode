import type { SupportedChatModel, SupportedChatModelId, SupportProvider } from "@nightcode/shared";
import type { LanguageModel } from "ai";

export type AnthropicModelId = Extract<SupportedChatModel, { provider: "anthropic" }>["id"]
export type OpenAIModelId = Extract<SupportedChatModel, { provider: "openai" }>["id"]
export type ResolvedModel = {
    model: LanguageModel,
    provider: SupportProvider,
    modelId: SupportedChatModelId
}

export type StreamParams = {
    sessionId:string;
    model:string;
    history: { role: "user" | "assistant"; content: string }[];
    mode: Mode;
    abortController: AbortController
}