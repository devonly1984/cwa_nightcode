import { TextAttributes } from "@opentui/core";
import { MAX_VISIBLE_MENTIONS } from "../../constants/fileMentions";
import type { FileMentionMenuProps } from "../../types/fileMentionTypes"
import { useTheme } from "../providers/theme/ThemeProvider"

const FileMention = ({candidates,selectedIndex,scrollRef,onSelect,onExecute}:FileMentionMenuProps) => {
    const {colors}= useTheme();
    const visibleHeight = Math.min(
      candidates.length,
      MAX_VISIBLE_MENTIONS,
    );
    if (candidates.length===0) {
        return (
          <box paddingX={1}>
            <text attributes={TextAttributes.DIM}>
              No matching files or folders
            </text>
          </box>
        );
    }

  return <scrollbox ref={scrollRef} height={visibleHeight}>
    {candidates.map((candidate,index)=>{
        const isSelected = index===selectedIndex;
        return (
          <box
            key={candidate.path}
            flexDirection="row"
            paddingX={1}
            height={1}
            overflow="hidden"
            backgroundColor={isSelected ? colors.selection : undefined}
            onMouseDown={() => onExecute(index)}
            onMouseMove={() => onSelect(index)}
          >
            <box flexGrow={1} flexShrink={1} overflow="hidden">
              <text selectable={false} fg={isSelected ? "black" : "white"}>
                {candidate.path}
              </text>
            </box>
            <box width={8} alignItems="flex-end" flexShrink={0}>
              <text selectable={false} fg={isSelected ? "black" : "gray"}>
                {candidate.kind === "directory" ? "Folder" : "File"}
              </text>
            </box>
          </box>
        );

        
    })}
  </scrollbox>;
}
export default FileMention