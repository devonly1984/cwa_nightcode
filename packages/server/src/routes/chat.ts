import { Hono } from "hono";
import { prisma } from "@nightcode/database";
import { MessageStatus } from "@nightcode/database/enums";
import { submitValidator } from "../schemas/chatSchema";
import { activeResumeSessionIds, buildConversationHistory, getResumableUserMessage, streamAiResponse } from "../lib/chatLib";
import { streamSSE } from "hono/streaming";
import type { ChatStreamEvent } from "@nightcode/shared";
import { isSupportedChatModel } from "../lib/models";



const app = new Hono().

post("/:sessionId/resume", async (c) => { 
  const sessionId = c.req.param('sessionId');
  const session = await prisma.session.findUnique({
    where:{id:sessionId},
    include: { messages: { orderBy: { createdAt: 'asc' } } }
  })
  if (!session) {
    return c.json({error:"Session not found"},404)
  }
  const resumeableMessage = getResumableUserMessage(session.messages);
  if (!resumeableMessage) {
    return c.json({ error: "Session has not pending user message to resume" }, 409)
  }
  if (!isSupportedChatModel(resumeableMessage.model)) {
    return c.json({ error: `Session uses unsupported model: ${resumeableMessage.model}` }, 409)
  }
   if (activeResumeSessionIds.has(sessionId)) {
     return c.json({ error: "Session already has an active resume" }, 409)
   }
  activeResumeSessionIds.add(sessionId)
  const history = buildConversationHistory(session.messages);
  const abortController = new AbortController();
  try {
  return streamSSE(
    c,
    async (stream) => {
      stream.onAbort(() => {
          abortController.abort()
        })
        try {
        await streamAiResponse(stream,{
          sessionId,
          model: resumeableMessage.model,
          history,
          mode: resumeableMessage.mode,
          abortController
        })
      }finally {
          activeResumeSessionIds.delete(sessionId)
      }
    },
    async(err,stream)=>{
      activeResumeSessionIds.delete(sessionId)
      const message=err instanceof Error ?err.message:String(err)
      const errorEvent:ChatStreamEvent={type:"error",message};
      await stream.writeSSE({ event: "error", data: JSON.stringify(errorEvent) })
    }
  )
}catch(error) {
  activeResumeSessionIds.delete(sessionId)
    throw error;

}
}).post("/:sessionId", submitValidator, async (c) => {
  const sessionId = c.req.param("sessionId");
  const session = await prisma.session.findUnique({
    where: {id:sessionId},
      include: { messages: { orderBy: { createdAt: 'asc' } } }
  })
  if (!session) {
      return c.json({ error: "Session not found" }, 404)
  }
  const data = c.req.valid("json");
  await prisma.message.create({
    data: {
        sessionId,
        role:"USER",
        status:MessageStatus.COMPLETE,
        model: data.model,
        content: data.content,
          mode: data.mode
    }
  })
  const history = buildConversationHistory([
    ...session.messages,
    {
        role: "USER" as const, content: data.content, status: MessageStatus.COMPLETE
    }
  ])
  const abortController = new AbortController();
  return streamSSE(
    c,
    async(stream)=>{
        stream.onAbort(()=>{
            abortController.abort()
        })
        await streamAiResponse(stream,{
            sessionId,
            model: data.model,
            history,
            mode: data.mode,
            abortController
        })
    },
    async(err,stream)=>{
        const message = err instanceof Error ?err.message:String(err);
        const errorEvent: ChatStreamEvent = { type: "error", message }
        await stream.writeSSE({ event: "error", data: JSON.stringify(errorEvent) })
    }
  )
})

export default app;