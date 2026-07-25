import { TextAttributes } from "@opentui/core";
import { useTheme } from "../providers/theme/ThemeProvider";
import { EmptyBorder } from "../../constants/border";
import type {
  ClientMessagePart,
  ClientToolCallPart,
} from "../../types/chatTypes";
import { Mode } from "@nightcode/database/enums";
import {
  formatToolArgs,
  formatToolName,
  groupConsecutiveParts,
} from "../../lib/utils";
interface Props {
  model: string;
  parts: ClientMessagePart[];
  mode: Mode;
  duration?: string;
  streaming?: boolean;
  interrupted?: boolean;
}
const BotMessage = ({
  parts,
  model,
  mode,
  duration,
  streaming = false,
  interrupted = false,
}: Props) => {
  const { colors } = useTheme();

  return (
    <box width={"100%"} alignItems="center">
      {groupConsecutiveParts(parts).map((group) => (
        <box key={group.key} paddingY={1} width="100%">
          {group.parts.map((part, i) => {
            if (part.type === "reasoning") {
              return (
                <box
                  key={`reasoning-${i}`}
                  border={["left"]}
                  borderColor={colors.thinkingBorder}
                  customBorderChars={{
                    ...EmptyBorder,
                    vertical: "|",
                  }}
                  width="100%"
                  paddingX={2}
                >
                  <text attributes={TextAttributes.DIM}>
                    <em fg={colors.thinking}>Thinking:</em>
                    {part.text}
                  </text>
                </box>
              );
            }
            if (part.type === "tool-call") {
              return (
                <box
                  key={part.id}
                  border={["left"]}
                  borderColor={colors.thinkingBorder}
                  customBorderChars={{
                    ...EmptyBorder,
                    vertical: "|",
                  }}
                  width="100%"
                  paddingX={2}
                >
                  <text attributes={TextAttributes.DIM}>
                    <em fg={colors.info}>{formatToolName(part.name)}:</em>
                    {formatToolArgs(part)}
                    {part.status === "calling" ? " ..." : ""}
                  </text>
                </box>
              );
            }
            if (part.type === "text") {
              return (
                <box key={`text-${i}`} paddingX={3} width="100%">
                  <text>{part.text}</text>
                </box>
              );
            }
            return null;
          })}
        </box>
      ))}
      <box paddingX={3} paddingBottom={1} gap={1} width={"100%"}>
        <box flexDirection="row" gap={2}>
          <text
            attributes={interrupted ? TextAttributes.DIM : 0}
            fg={
              interrupted
                ? undefined
                : mode === Mode.PLAN
                  ? colors.planMode
                  : colors.primary
            }
          >
            &#9673;
          </text>
          <box flexDirection="row" gap={1}>
            <text>{mode === Mode.PLAN ? "Plan" : "Build"}</text>
            <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
              &#8250;
            </text>
            <box flexDirection="row" gap={1}>
              <text attributes={interrupted ? TextAttributes.DIM : 0}>
                {mode === Mode.PLAN ? "Plan" : "Build"}
              </text>
              <text
                attributes={TextAttributes.DIM}
                fg={colors.dimSeparator}
              >
                &#8250;
              </text>
            </box>
            <text attributes={TextAttributes.DIM}>{model}</text>
            {(duration || interrupted) && (
              <>
                <text
                  attributes={TextAttributes.DIM}
                  fg={colors.dimSeparator}
                >
                  &#8250;
                </text>
                <text attributes={TextAttributes.DIM}>
                  {interrupted ? "interrupted" : duration}
                </text>
              </>
            )}
          </box>
        </box>
      </box>
    </box>
  );
};
export default BotMessage;
