import { MessageStatus, Mode, Prisma, prisma } from "@nightcode/database";
import {
  messagePartSchema,
  messagePartsSchema,
  toolCallArgsSchema,
  type ChatStreamEvent,
  type MessagePart,
} from "@nightcode/shared";
import { resolveChatModel } from "./models";
import type { IngestUsageFormMessageParams, StreamParams } from "../types";
import type { streamSSE } from "hono/streaming";
import { streamText as aiStreamText,stepCountIs } from "ai";
import { createTools } from "../tools";
import { buildSystemPrompt } from "../prompts/SystemPrompt";
import type { LanguageModelUsage } from "ai"
import {calculateCreditsForUsage} from '../lib/polar/credits';
import { ingestAiUsage } from "./polar/polar";
export const activeResumeSessionIds = new Set<string>();

export const getResumableUserMessage = (
  messages: {
    role: "USER" | "ASSISTANT" | "ERROR";
    model: string;
    mode: Mode;
  }[],
) => {
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== "USER") {
    return null;
  }
  return lastMessage;
};
export const buildConversationHistory = (
  messages: {
    role: "USER" | "ASSISTANT" | "ERROR";
    content: string;
    status: MessageStatus;
  }[],
) => {
  return messages.flatMap((m) => {
    if (m.role === "ERROR") return [];
    if (m.role === "ASSISTANT" && m.content.length === 0) return [];
    return [
      {
        role:
          m.role === "USER" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      },
    ];
  });
};

export const streamAiResponse = async (
  stream: Parameters<Parameters<typeof streamSSE>[1]>[0],
  params: StreamParams,
) => {
  const { sessionId, userId, model, cwd, history, mode, abortController } = params;
  const startTime = Date.now();
  const tools = cwd ? createTools(cwd, mode) : undefined
  const parts: MessagePart[] = [];
  const resolvedModel = resolveChatModel(model);
  let completedUsage: LanguageModelUsage | null = null;


  const persistInterruptedMesage = async () => {
    const fullText = parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("");
    if (fullText.length === 0 && parts.length === 0) {
      return;
    }
    const elapsedms = Date.now() - startTime;
    const validatedParts: Prisma.InputJsonValue | undefined =
      parts.length > 0 ? messagePartSchema.parse(parts) : undefined;
    return prisma.message.create({
      data: {
        sessionId,
        role: "ASSISTANT",
        status: MessageStatus.INTERRUPTED,
        model,
        content: fullText,
        parts: validatedParts,
        mode,
        duration: Math.round(elapsedms / 1000),
      },
    });
  };

  const ingestUsageForMessage = async ({ messageId, status }: IngestUsageFormMessageParams) => {
    if(!completedUsage){
      return;
    }
    try {
      const billableUsage = calculateCreditsForUsage({
        provider: resolvedModel.provider,
        model: resolvedModel.modelId,
        usage: completedUsage
      })
      await ingestAiUsage({
        externalCustomerId: userId,
     eventId: `chat-message:${messageId}`,
     credits: billableUsage.credits
      })
    }
    catch (error) {
      console.error("Failed to ingest Polar Ai usage for chat message",{
        error,
        sessionId,
        messageId,
        userId
      })

    }
  }
  const persistInterruptedMessageAndUsage = async()=>{
    const interruptedMessage = await persistInterruptedMesage();
    if (!interruptedMessage) {
      return;
    }
    await ingestUsageForMessage({
      messageId: interruptedMessage.id,
      status: 'interrupted'
    })
  }
  try {
    const result = aiStreamText({
      model: resolvedModel.model,
      system: buildSystemPrompt({ cwd, mode }),
      messages: history,
      tools,
      stopWhen: tools ? stepCountIs(50) : undefined,
      abortSignal: abortController.signal,
      providerOptions: resolvedModel.providerOptions,
      onFinish(event){
        completedUsage = event.usage;

      }
    });
    for await (const part of result.stream) {
      if (stream.aborted) break;
      if (part.type === "reasoning-delta") {
        const last = parts[parts.length - 1];
        if (last && last.type === "reasoning") {
          last.text += part.text;
        } else {
          parts.push({ type: "reasoning", text: part.text });
        }
        const event: ChatStreamEvent = {
          type: "reasoning-delta",
          text: part.text,
        };
        await stream.writeSSE({
          event: "reasoning-delta",
          data: JSON.stringify(event),
        });
      }
      if (part.type === "text-delta") {
        const last = parts[parts.length - 1];
        if (last && last.type === "text") {
          last.text += part.text;
        } else {
          parts.push({ type: "text", text: part.text });
        }
        const event: ChatStreamEvent = {
          type: "text-delta",
          text: part.text,
        };
        await stream.writeSSE({
          event: "text-delta",
          data: JSON.stringify(event),
        });
      }
      if (part.type === "tool-call") {
        const args = toolCallArgsSchema.parse(part.input);
        parts.push({
          type: "tool-call",
          id: part.toolCallId,
          name: part.toolName,
          args,
        });
        const event: ChatStreamEvent = {
          type: "tool-call",
          toolCallId: part.toolCallId,
          toolName: part.toolName,
          args,
        };
        await stream.writeSSE({
          event: "tool-call",
          data: JSON.stringify(event),
        });
      }
      if (part.type === "tool-result") {
        const resultStr =
          typeof part.output === "string"
            ? part.output
            : JSON.stringify(part.output);
        const toolPart = parts.find(
          (p): p is Extract<MessagePart, { type: "tool-call" }> =>
            p.type === "tool-call" && p.id === part.toolCallId,
        );
        if (toolPart) {
          toolPart.result = resultStr;
        }
        const event: ChatStreamEvent = {
          type: "tool-result",
          toolCallId: part.toolCallId,
          result: resultStr,
        };
        await stream.writeSSE({
          event: "tool-result",
          data: JSON.stringify(event),
        });
      }

      if (part.type === "error") {
        throw part.error;
      }
    }
    if (stream.aborted || abortController.signal.aborted) {
      await persistInterruptedMessageAndUsage();
      return;
    }
    const elapsedMs = Date.now() - startTime;
    const fullText = parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("");
    const validatedParts: Prisma.InputJsonValue | undefined =
      parts.length > 0 ? messagePartsSchema.parse(parts) : undefined;

    const assistantMessage = await prisma.message.create({
      data: {
        sessionId,
        role: "ASSISTANT",
        status: MessageStatus.COMPLETE,
        model,
        content: fullText,
        parts: validatedParts,
        mode,
        duration: Math.round(elapsedMs / 1000),
      },
    });
    await ingestUsageForMessage({
      messageId: assistantMessage.id,
      status: 'complete'
    })
    const event: ChatStreamEvent = {
      type: "done",
      messageId: assistantMessage.id,
      durationMs: elapsedMs,
    };
    await stream.writeSSE({
      event: "done",
        data: JSON.stringify(event),
    });
  } catch (error) {
    if (abortController.signal.aborted) {
      await persistInterruptedMessageAndUsage();
      return;
    }
    const message = error instanceof Error ? error.message : String(error);
    await prisma.message.create({
      data: {
        sessionId,
        role: "ERROR",
        status: MessageStatus.COMPLETE,
        model,
        content: message,
        mode,
      },
    });
    const errorEvent: ChatStreamEvent = { type: "error", message };
    await stream.writeSSE({
      event: "error",
      data: JSON.stringify(errorEvent),
    });
  }
};
