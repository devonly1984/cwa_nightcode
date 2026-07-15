import { useState, useRef, useCallback, useEffect } from "react";
import { EventSourceParserStream } from "eventsource-parser/stream";
import prettyMs from "pretty-ms";
import type { ClientResponse } from "hono/client";
import { apiClient } from "../lib/apiClient";
import { getErrorMessage } from "../lib/httpErrors";

import {
  chatStreamEventSchema,
 
} from "@nightcode/shared";
import type {
  StreamingState,
  Message,
  ActiveStream,
  ClientMessagePart,
  RunStreamParams,
  SubmitParams,
} from "../types/chatTypes";


export const useChat = (sessionId: string, initialMessages: Message[]) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [streaming, setStreaming] = useState<StreamingState>({
    status: "idle",
  });
  const activeStreamingRef = useRef<ActiveStream | null>(null);

  const updateMessages = useCallback(
    (updater: (prev: Message[]) => Message[]) => {
      setMessages((prev) => updater(prev));
    },
    [],
  );
  const isActiveRequest = useCallback((requestId: string) => {
    return activeStreamingRef.current?.requestId === requestId;
  }, []);

  const emitParts = useCallback(
    (requestId: string, parts: ClientMessagePart[]) => {
      if (!isActiveRequest(requestId)) return;

      const snapshot = [...parts];
      const activeStream = activeStreamingRef.current;
      if (!activeStream) return;

      activeStream.parts = snapshot;
      setStreaming({
        status: "streaming",
        parts: snapshot,
        mode: activeStream.mode,
        model: activeStream.model,
      });
    },
    [isActiveRequest],
  );
  const captureInterruptedMessage = useCallback((activeStream:ActiveStream)=>{
    if (activeStream.interruptedCaptured || activeStream.parts.length===0) {
        return;
    }
    activeStream.interruptedCaptured=true;
    const parts = [...activeStream.parts];
      const fullText = parts.filter(p => p.type === 'text').map(p => p.text).join("")
      updateMessages(prev=>[...prev,{
        id: crypto.randomUUID(),
        role: "assistant",
        content: fullText,
        mode: activeStream.mode,
        model: activeStream.model,
        parts,
          interrupted: true
      }])
  }, [updateMessages])
  const clearStream = useCallback(
    (requestId: string) => {
      if (!isActiveRequest(requestId)) return;
      activeStreamingRef.current = null;
      setStreaming({ status: "idle" });
    },
    [isActiveRequest],
  );
  const handleStream = useCallback(
    async (
      response: ClientResponse<unknown>,
      activeStream: ActiveStream,
    ) => {
      if (!isActiveRequest(activeStream.requestId)) return;
      if (!response.ok) {
        const message = await getErrorMessage(response);
        updateMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "error",
            content: message,
          },
        ]);
        return;
      }
      const parts: ClientMessagePart[] = [];
      const stream = response
        .body!.pipeThrough(new TextDecoderStream())
        .pipeThrough(new EventSourceParserStream());
        for await (const {data} of stream){
            if (!isActiveRequest(activeStream.requestId)) return;
            let event;
            try {
                event = chatStreamEventSchema.parse(JSON.parse(data));

            } catch (error) {
                const message = error instanceof Error ? error.message : "Invalid stream event"
                updateMessages(prev=>[
                    ...prev,
                    {
                        id: crypto.randomUUID(),
                        role: "error",
                        content: message
                    }
                ])
                break;
            }
            switch(event.type) {
                case 'text-delta': {
                    const last = parts[parts.length-1];
                    if (last && last.type==='text') {
                        last.text+=event.text;
                    } else {
                        parts.push({ type: "text", text: event.text })
                    }
                    emitParts(activeStream.requestId, parts)
                    break;
                }
                case 'done': {
                    if (!isActiveRequest(activeStream.requestId)) return;
                    const fullText = parts.filter(p => p.type === 'text').map(p => p.text).join("")
                    updateMessages(prev=>[
                        ...prev,
                        {
                            id: event.messageId,
                            role:"assistant",
                            content: fullText,
                            mode: activeStream.mode,
                            model: activeStream.model,
                            duration: prettyMs(event.durationMs),
                            parts: [...parts]
                        }
                    ]);
                    break;
                }
                case 'error':  {
                    updateMessages(prev=>[
                        ...prev,{
                            id: crypto.randomUUID(),
                            role:"error",
                            content: event.message
                        }
                    ])
                    break;
                }
            }
        }
    },
      [updateMessages, emitParts, isActiveRequest],
  );
  const runStream = useCallback(async (
      { mode, model, request }: RunStreamParams
  )=>{
    const controller = new AbortController();
    const activeStream:ActiveStream ={
        requestId: crypto.randomUUID(),
        controller,
        mode,
        model,
        parts: [],
        interruptedCaptured: false
    }
    activeStreamingRef.current=activeStream;
      setStreaming({ status: "streaming", parts: [], mode, model })
      try {
        const response = await request(controller);
          await handleStream(response, activeStream)

      } catch (error) {
        if (error instanceof DOMException&& error.name==='AbortError') {
            return;
        }
        if (!isActiveRequest(activeStream.requestId))return;
          const msg = error instanceof Error ? error.message : String(error)
          updateMessages(prev=>[...prev,{
            id: crypto.randomUUID(),
            role:"error",
              content:msg
          }]

          )
      } finally {
          clearStream(activeStream.requestId)
      }
  }, [clearStream, handleStream, isActiveRequest, updateMessages])
    const resume = useCallback(async ({ mode, model }: Omit<SubmitParams, "userText">) => { 
        await runStream({
            mode,
            model,
            request: async(controller)=>{
                return apiClient.chat[":sessionId"].resume.$post(
                    { param: { sessionId } }, { init: { signal: controller.signal } }
                )
            }
        })
    }, [runStream, sessionId])
    const hasAutoResumedRef = useRef(false);
    useEffect(()=>{
        if (hasAutoResumedRef.current) return;
        const last = initialMessages[initialMessages.length-1]
        if (!last || last.role !== 'user') return;
        hasAutoResumedRef.current=true;
        void resume({ mode: last.mode, model: last.model })

    }, [initialMessages, resume])
    const stopActiveStream = useCallback((capturePartial:boolean)=>{
        const activeStream = activeStreamingRef.current;
        if (!activeStream) return;
        if (capturePartial) {
            captureInterruptedMessage(activeStream)
        }
        activeStreamingRef.current=null;
        setStreaming({status:"idle"});
        activeStream.controller.abort()
    }, [captureInterruptedMessage])

    const submit =useCallback(async(
        {userText,mode,model}:SubmitParams
    )=>{
        stopActiveStream(true);

        const userMessage:Message={
            id: crypto.randomUUID(),
            role:"user",
            content:userText,
            mode,
            model
        }
        updateMessages(prev => [...prev, userMessage])
        await runStream({mode,model,request:async(controller)=>{
            return apiClient.chat[":sessionId"].$post(
                { param: { sessionId }, json: { content: userText, mode, model } },
                { init: { signal: controller.signal } }
            )
        }})
    }, [runStream, sessionId, updateMessages, stopActiveStream]);
    const abort = useCallback(()=>{
        stopActiveStream(false);

        
    }, [stopActiveStream])
    const interrrupt = useCallback(()=>{
        stopActiveStream(true)
    },[stopActiveStream])
return {
    messages, streaming, submit, abort,
    interrrupt
}
};
