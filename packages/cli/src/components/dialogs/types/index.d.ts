import type { SupportedChatModelId } from "@nightcode/shared";

export type AgentsDialogProps ={
  currentMode:Mode;
  onSelectMode: (mode: Mode) => void;
}
export type ModelsDialogProps ={
 models:SupportedChatModelId[]
    onSelectModel: (modelId: SupportedChatModelId) => void;
}

export type SessionDialogProps = InferResponseType<
  (typeof apiClient.sessions)["$get"],
  200
>[number];