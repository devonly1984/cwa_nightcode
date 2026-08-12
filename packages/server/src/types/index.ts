import type { SupportedChatModel, SupportedChatModelId, SupportProvider } from "@nightcode/shared";
import type { LanguageModel } from "ai";
import type { ProviderOptions } from '@ai-sdk/provider-utils'

import type { Mode } from "@nightcode/database";

export type AnthropicModelId = Extract<SupportedChatModel, { provider: "anthropic" }>["id"]

export type OpenAIModelId = Extract<SupportedChatModel, { provider: "openai" }>["id"]

export type ResolvedModel = {
    model: LanguageModel,
    provider: SupportProvider,
    modelId: SupportedChatModelId
    providerOptions?:ProviderOptions
}

export const ANTHROPIC_PROVIDER_OPTIONS: Partial<Record<AnthropicModelId, ProviderOptions>> = {
    "claude-opus-4-6":{
        anthropic: {
            thinking: {
                type:'enabled',
                budgetTokens: 10000,
            }
        }
    },
    "claude-sonnet-4-6":{
        anthropic:{
            thinking: {
                type:'enabled',
                budgetTokens: 10000
            }
        }
    }
}
export const OPENAI_PROVIDER_OPTIONS:Partial<Record<OpenAIModelId,ProviderOptions>>={
    "gpt-5.4":{
        openai: {
            thinking: {
                reasoningSummry: "detailed"
            }
        }
    }
}

export type StreamParams = {
    sessionId:string;
    userId: string;
    model:string;
    cwd: string | null;
    history: { role: "user" | "assistant"; content: string }[];
    mode: Mode;
    abortController: AbortController
}
export type IngestUsageFormMessageParams ={
    messageId:string;
    status: "complete" | "interrupted";
}