import {anthropic} from '@ai-sdk/anthropic'
import {openai} from '@ai-sdk/openai'
import { ANTHROPIC_PROVIDER_OPTIONS, OPENAI_PROVIDER_OPTIONS, type AnthropicModelId, type OpenAIModelId, type ResolvedModel } from "../types";
import { findSupportedChatModel, type SupportedChatModel,type SupportedChatModelId } from '@nightcode/shared';

 const assertUnspportedProvider=(provider:never):never=>{
     throw new Error(`Unsupported provider: ${provider}`)

}

const resolveAnthropicModel = (modelId:AnthropicModelId):ResolvedModel=>{
    return {
        model: anthropic(modelId),
        provider: 'anthropic',
        modelId,
        providerOptions: ANTHROPIC_PROVIDER_OPTIONS[modelId]
    }
}

const resolveOpenIModel = (modelId:OpenAIModelId):ResolvedModel=>{
    return {
        model: openai(modelId),
        provider: "openai",
        modelId,
        providerOptions: OPENAI_PROVIDER_OPTIONS[modelId]
    }
}
const resolveSuportedChatModel = (model:SupportedChatModel):ResolvedModel=>{
const provider = model.provider;

switch(provider) {
    case "anthropic":
        return resolveAnthropicModel(model.id);
    case 'openai':
        return resolveOpenIModel(model.id);
    default:
        return assertUnspportedProvider(provider)
}
}
export const isSupportedChatModel = (modelId:string):modelId is SupportedChatModelId=>{
    return findSupportedChatModel(modelId) != null;

}

export const resolveChatModel = (modelId:string):ResolvedModel=>{
    const model = findSupportedChatModel(modelId);
    if (!model) {
        throw new Error(`Unsupported model: ${modelId}`);
    }
    return resolveSuportedChatModel(model)
}

