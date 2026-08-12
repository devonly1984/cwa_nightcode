import type { ModeType } from "@nightcode/shared";
import type { SupportedChatModelId } from "@nightcode/shared";
import type { ClientResponse } from "hono/client";
import type { Message } from '../types'



export type ClientMessagePart = Message['parts'][number];
export type ClientToolCallPart = Extract<ClientMessagePart, { type: `tool-${string}` | "dyanmic-tool" }>

export type StreamingState = {
    status:"idle"
}|{
    status:"streaming",
    parts:ClientMessagePart[];
    mode:ModeType;
    model:SupportedChatModelId
}
export type ActiveStream ={
    requestId:string;
    controller: AbortController;
    mode:ModeType;
    model:SupportedChatModelId;
    parts: ClientMessagePart[]
    interruptedCaptured: boolean;
}

export type SubmitParams = {
    userText:string;
    mode:ModeType;
    model: SupportedChatModelId
}
export type RunStreamParams ={
    mode:ModeType;
    model:SupportedChatModelId;
    request: (controller: AbortController) => Promise<ClientResponse<unknown>>
}
export type PartGroup = {
    type: ClientMessagePart["type"];
    parts: ClientMessagePart[];
    key: string;
}