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