import { MessageStatus, Mode, prisma } from "@nightcode/database";
import type { ChatStreamEvent } from "@nightcode/shared";
import { resolveChatModel } from "./models";
import type { StreamParams } from "../types";
import type { streamSSE } from "hono/streaming";
import { streamText as aiStreamText } from 'ai';

export const activeResumeSessionIds = new Set<string>()

export const getResumableUserMessage = (messages: {
    role: "USER"|"ASSISTANT"|"ERROR";
    model: string;
    mode: Mode
}[])=>{
    const lastMessage = messages[messages.length-1];
    if (!lastMessage||lastMessage.role!=="USER") {
        return null;
    }
    return lastMessage

}
export const buildConversationHistory = (
    messages: { role: "USER" | "ASSISTANT" | "ERROR"; content: string; status: MessageStatus }[]
)=>{
    return messages.flatMap(m=>{
        if (m.role==="ERROR") return [];
        if (m.role === 'ASSISTANT' && m.content.length === 0) return []
        return [
            {
                role: m.role==="USER" ? ("user" as const):("assistant" as const),
                content: m.content
            }
        ]
    })
}

export const streamAiResponse = async(
    stream: Parameters<Parameters<typeof streamSSE>[1]>[0],
    params: StreamParams
)=>{
    const { sessionId, model, history, mode, abortController } = params;
    const startTime = Date.now();
    const resolvedModel = resolveChatModel(model);
    let fullText = "";
    const persistInterruptedMesage = async()=>{
        if (fullText.length===0)return;
        const elapsedms = Date.now()-startTime;
        await prisma.message.create({
            data: {
                sessionId,
                role: "ASSISTANT",
                status: MessageStatus.INTERRUPTED,
                model,
                content: fullText,
                mode,
                duration: Math.round(elapsedms/1000)
            }
        })
    }
    try {
        const result = aiStreamText({
            model: resolvedModel.model,
            messages: history,
            abortSignal: abortController.signal
        })
        for await (const part of result.stream) {
            if (stream.aborted) return;
            if (part.type==='text-delta') {
                fullText += part.text;
                const event: ChatStreamEvent = { type: "text-delta", text: part.text }
                await stream.writeSSE({ event: "text-delta", data: JSON.stringify(event) })
            }
            if (part.type==='error') {
                throw part.error;
            }

        }
        if (stream.aborted||abortController.signal.aborted) {
            await persistInterruptedMesage()
            return;
        }
        const elapsedMs = Date.now() - startTime;
        const assistantMessage = await prisma.message.create({
            data: {
                sessionId,
                role: "ASSISTANT",
                status: MessageStatus.COMPLETE,
                model,
                content: fullText,
                mode,
                duration: Math.round(elapsedMs / 1000)
            }
        })
        const doneEvent:ChatStreamEvent = {
            type: "done",
            messageId: assistantMessage.id,
            durationMs: elapsedMs
        }
        await stream.writeSSE({ event: 'done', data: JSON.stringify(doneEvent) })

    } catch (error) {
        if (abortController.signal.aborted) {
            await persistInterruptedMesage()
            return;
        }
        const message = error instanceof Error ? error.message : String(error);
        await prisma.message.create({
            data: {
                sessionId,
                role: "ERROR",
                status: MessageStatus.COMPLETE,
                model,
                content:message,
                mode
            }
        });
        const errorEvent: ChatStreamEvent = { type: "error", message }
        await stream.writeSSE({ event: "error", data: JSON.stringify(errorEvent) })
    }

}