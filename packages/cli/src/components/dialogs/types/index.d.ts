import type {ModeType, SupportedChatModelId } from "@nightcode/shared";

export type AgentsDialogProps ={
  currentMode:ModeType;
  onSelectMode: (mode: ModeType) => void;
}
export type ModelsDialogProps ={
 models:SupportedChatModelId[]
    onSelectModel: (modelId: SupportedChatModelId) => void;
}

export type SessionDialogProps = InferResponseType<
  (typeof apiClient.sessions)["$get"],
  200
>[number];