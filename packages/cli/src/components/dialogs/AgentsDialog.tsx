import { useCallback } from "react";
import { useDialog } from "../providers/dialog/DialogProvider";
import { DialogSearchList } from "../menus/DialogSearchList";

import type { ModeType } from "@nightcode/shared";
import { AVAILABLE_MODES } from "../../constants/modes";
import { getModeLabel } from "../../lib/utils";
import type { AgentsDialogProps } from "./types";

export const AgentsDialogContent = ({
  currentMode,
  onSelectMode,
}: AgentsDialogProps) => {
  const dialog = useDialog();

  const handleSelect = useCallback(
    (nextMode: ModeType) => {
      onSelectMode(nextMode);
      dialog.close();
    },
    [onSelectMode, dialog],
  );

  return (
    <DialogSearchList
      items={AVAILABLE_MODES}
      onSelect={handleSelect}
      filterFn={(item, query) =>
        getModeLabel(item).toLowerCase().includes(query.toLowerCase())
      }
      renderItem={(item, isSelected) => (
        <>
          <text selectable={false} fg={isSelected ? "black" : "white"}>
            {item === currentMode ? " *" : " "}
            {getModeLabel(item)}
          </text>
        </>
      )}
      getKey={(item) => item}
      placeholder="Search agents"
      emptyText="No Matching agents"
    />
  );
};
