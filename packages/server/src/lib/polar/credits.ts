import {SUPPORTED_CHAT_MODELS,findSupportedChatModel,type ModelPricing} from '@nightcode/shared'
import type { LanguageModelUsage } from 'ai'

type CalculatedCreditsForUsageParams = { 
    provider:string;
    model:string;
    usage: LanguageModelUsage;
}
type BillableUsage ={
    credits: number;
}
type TokenCounts = {
    inputTokens:number;
    outputTokens: number;
}

const TOKENS_PER_MILLION = 1_000_000;

const USD_PER_CREDIT = 0.01

const getTokensCounts = (usage: LanguageModelUsage):TokenCounts=>{
    const inputTokens = usage.inputTokens??0;
    const outputTokens = usage.outputTokens ?? 0;
    if (inputTokens ===null || outputTokens === null) {
        throw new Error("Credit conversion requires input and output token counts")
    }
    return {
        inputTokens,
        outputTokens
        
    }
}

const getModelPricing = (provider: string, model: string):ModelPricing=>{
    const supportedModel = findSupportedChatModel(model);
    if (!supportedModel||supportedModel.provider!==provider) {
        if (!SUPPORTED_CHAT_MODELS.some(supportedModel=>supportedModel.provider===provider)) {
            throw new Error(`Unsupported billing provider: ${provider}`)
        }

        throw new Error(`Unsuported billing model: ${model}`);
}
    return supportedModel.pricing;
}
const estimateCostUsd = ({inputTokens,outputTokens}:TokenCounts,pricing:ModelPricing)=>{
    return (inputTokens*pricing.inputUsdPerMillionTokens+outputTokens*pricing.outputUsdPerMillionTokens)/TOKENS_PER_MILLION;
}

const convertUsdToCredits = (estimatedCostUsd:number)=>{
    if (estimatedCostUsd<=0) {
        return 0;
    }
    return Math.max(estimatedCostUsd / USD_PER_CREDIT);
}
export const calculateCreditsForUsage = ({provider,model,usage}:CalculatedCreditsForUsageParams):BillableUsage=>{
    const tokenCounts = getTokensCounts(usage);
    const modelPricing = getModelPricing(provider,model);
    const estimatedCostUsd = estimateCostUsd(tokenCounts, modelPricing);
    const credits = convertUsdToCredits(estimatedCostUsd);
    return { credits };
}