import { Hono } from "hono";
import { prisma } from "@nightcode/database/client";
import { submitValidator } from "../lib/chat/schemas/submitSchema";
import { resolveChatModel } from "../lib/models";
import type { AuthenticatedEnv } from "../middleware/requireAuth";
import { requiredCreditsBalance } from '../middleware/requireCeditsBalance'
import { getToolContracts } from "@nightcode/shared";
import type { NightcodeUIMessage } from "../lib/chat/types";
import { convertToModelMessages, streamText, validateUIMessages, type LanguageModelUsage } from "ai";
import { buildSystemPrompt } from "../prompts/SystemPrompt";
import { hasPendingToolCalls } from "../lib/chat/chatLib";
import type { Prisma } from "@nightcode/database";
import { calculateCreditsForUsage } from "../lib/polar/credits";
import { ingestAiUsage } from "../lib/polar/polar";




const app = new Hono<AuthenticatedEnv>()
  .post('/',requiredCreditsBalance,submitValidator,async(c)=>{
    const userId = c.get("userId");
    const { id, messages, mode, model } = c.req.valid('json')
    const session = await prisma.session.findUnique({
      where: { id: userId }
    })
    if (!session) {
      return c.json({ error: "Session not found" }, 404)
    }
    const startTime = Date.now();
    const tools = getToolContracts(mode);
    const resolvedModel = resolveChatModel(model);
    const previousMessages = Array.isArray(session.messages) ? (session.messages as unknown as NightcodeUIMessage[]) : []
    const mergedMessages = [...previousMessages];
    for (const message of messages) {
      const incomingMessage = {
        ...message,
        metadata: {...message.metadata,mode,model}
      } satisfies NightcodeUIMessage
      const existingMessageIndex = mergedMessages.findIndex(m => m.id === incomingMessage.id);
      if (existingMessageIndex===-1) {
        mergedMessages.push(incomingMessage)
      } else {
        mergedMessages[existingMessageIndex]=incomingMessage
      }

    }
    const nextMessages = await validateUIMessages<NightcodeUIMessage>({
      messages: mergedMessages,
      tools
    })
    const modelMessages = await convertToModelMessages(nextMessages, { tools })
    let completedUsage:LanguageModelUsage|null=null;
    const result = streamText({
      model: resolvedModel.model,
      system: buildSystemPrompt({mode}),
      messages: modelMessages,
      tools,
      providerOptions: resolvedModel.providerOptions,
      onFinish(event){
        completedUsage = event.usage;

      }
    })
    return result.toUIMessageStreamResponse<NightcodeUIMessage>({
      originalMessages: nextMessages,
      messageMetadata({part}) {
        if (part.type==='start') {
          return {mode,model}
        }
        if (part.type === 'finish') { return undefined }
        return {
          mode,
          model,
          durationMs: Date.now() - startTime, ...(completedUsage ? { usage: completedUsage } : {})

        }
      },
      async onFinish(event){
        if (event.isAborted) return;
        if (hasPendingToolCalls(event.responseMessage)) return;
        await prisma.session.update({
          where:{id:userId},
          data: {
            messages: event.messages as unknown as Prisma.InputJsonValue,
          }
        })
        if (!completedUsage) return;
        try {
          const billableUsage = calculateCreditsForUsage({
            provider: resolvedModel.provider,
            model: resolvedModel.modelId,
            usage: completedUsage
          })
          await ingestAiUsage({
            externalCustomerId: userId,
            eventId: `chat-message:${event.responseMessage.id}`,
            credits: billableUsage.credits
          })
        } catch (error) {
          console.error("Failed to ingest Polar AI Usage for chat message",{
            error,
            sessionId:id,
            messageId:event.responseMessage.id,
            userId
          })
          
        }
      

      },
      onError(error) {
        return error instanceof Error ?error.message:String(error)
      }


    })

  })

export default app;
