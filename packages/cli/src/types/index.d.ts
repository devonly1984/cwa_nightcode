import type { InferResponseType } from "hono";
import type { apiClient } from "../lib/apiClient";

import type { ModeType, SupportedChatModelId, ToolContracts } from "@nightcode/shared";
import type { InferUITools, UIMessage } from "ai";


export type CommandContext = {
  exit: () => void;
  toast: ToastContextValue;
  dialog: DialogContextValue;
  navigate: (path: string) => void;
  mode: ModeType;
  setMode:(mode:ModeType)=>void;
  setModel: (model: SupportedChatModelId) => void;
};

export type Command = {
  name: string;
  description: string;
  value: string;
  action?: (ctx: CommandContext) => void | Promise<void>;
};

export type ErrorResponse = {
  json: () => Promise<unknown>;
  status: number;
  statusText: string;
};
export type SessionData = InferResponseType<
  (typeof apiClient.sessions)[":id"]["$get"],
  200
>;
export type ChatMessageMetadata = {
  mode?:ModeType;
  model?:SupportedChatModelId;
  durationMs?:number;
  usage?: LanguageModelUsage;
}
export type ChatTools = {
  [Name in keyof InferUITools<ToolContracts>]: {
    input: InferUITools<ToolContracts>[Name]['input'];
  output: unknown;
  }
}
export type Message = UIMessage<ChatMessageMetadata, never, ChatTools>