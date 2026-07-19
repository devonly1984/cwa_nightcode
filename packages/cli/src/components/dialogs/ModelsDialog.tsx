import { useCallback } from "react";
import { useDialog } from "../providers/dialog/DialogProvider";
import { DialogSearchList } from "../menus/DialogSearchList";
import type { ModelsDialogProps } from "./types";
import type { SupportedChatModelId } from "@nightcode/shared";

export const ModelsDialogContent = ({
  models,
  onSelectModel,
}: ModelsDialogProps) => {
  const dialog = useDialog();

  const handleSelect = useCallback(
    (modelId: SupportedChatModelId) => {
    onSelectModel(modelId)
      dialog.close();
    },
    [onSelectModel, dialog],
  );

  return (
    <DialogSearchList
      items={models}
      onSelect={handleSelect}
      filterFn={(modelId, query) =>
        modelId.toLowerCase().includes(query.toLowerCase())
      }
      renderItem={(modelId, isSelected) => (
        <text selectable={false} fg={isSelected ? "black" : "white"}>
          {modelId}
        </text>
      )}
      getKey={(modelId) => modelId}
      placeholder="Search models"
      emptyText="No Matching models"
    />
  );
};
