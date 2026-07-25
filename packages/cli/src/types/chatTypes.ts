import type { Mode } from "@nightcode/database/enums";
import type { SupportedChatModelId } from "@nightcode/shared";
import type { ClientResponse } from "hono/client";


export type ClientToolCallPart = {
    type: "tool-call",
    id:string;
    name:string;
    args: Record<string,unknown>;
    result?:string;
    status: "calling" | "done"
}
export type ClientMessagePart = | { type: 'reasoning', text: string } | ClientToolCallPart | { type: 'text', text: string }
export type Message =
  | {
      id: string;
      role: "user";
      content: string;
      mode: Mode;
      model: SupportedChatModelId;
    }
  | {
      id: string;
      role: "assistant";
      content: string;
      mode: Mode;
      model: SupportedChatModelId;
      parts: ClientMessagePart[];
        duration?: string;
        interrupted?: boolean;
    } | { id: string, role: "error", content: string }
export type StreamingState = {
    status:"idle"
}|{
    status:"streaming",
    parts:ClientMessagePart[];
    mode:Mode;
    model:SupportedChatModelId
}
export type ActiveStream ={
    requestId:string;
    controller: AbortController;
    mode:Mode;
    model:SupportedChatModelId;
    parts: ClientMessagePart[]
    interruptedCaptured: boolean;
}

export type SubmitParams = {
    userText:string;
    mode:Mode;
    model: SupportedChatModelId
}
export type RunStreamParams ={
    mode:Mode;
    model:SupportedChatModelId;
    request: (controller: AbortController) => Promise<ClientResponse<unknown>>
}
export type PartGroup = {
    type: ClientMessagePart['type'];
    parts: ClientMessagePart[];
    key: string;
}