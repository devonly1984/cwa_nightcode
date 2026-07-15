import type { InferResponseType } from "hono";
import type { apiClient } from "../lib/apiClient";


export type CommandContext = {
  exit: () => void;
  toast: ToastContextValue;
  dialog: DialogContextValue;
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
