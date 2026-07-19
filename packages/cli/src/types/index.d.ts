import type { InferResponseType } from "hono";
import type { apiClient } from "../lib/apiClient";
import type { Mode } from "@nightcode/database";
import type { SupportedChatModelId } from "@nightcode/shared";


export type CommandContext = {
  exit: () => void;
  toast: ToastContextValue;
  dialog: DialogContextValue;
  navigate: (path: string) => void;
  mode: Mode;
  setMode:(mode:Mode)=>void;
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
