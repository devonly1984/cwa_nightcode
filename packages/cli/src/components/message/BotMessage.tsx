import { TextAttributes } from "@opentui/core";
import { useTheme } from "../providers/theme/ThemeProvider";
import { EmptyBorder } from "../../constants/border";
import { Mode,type ModeType } from "@nightcode/shared";
import prettyMs from "pretty-ms";
import {
  formatToolArgs,
  formatToolName,
  groupConsecutiveParts,
  isToolPart,
} from "../../lib/utils";
import type { ClientMessagePart, ClientToolCallPart } from "../../types/chatTypes";
interface Props {
  model: string;
  parts: ClientMessagePart[];
  mode: ModeType;
  durationMs?: number;
  streaming?: boolean;
}
const BotMessage = ({
  parts,
  model,
  mode,
  durationMs,
  streaming = false,
}: Props) => {
  const { colors } = useTheme();

  return (
    <box width={"100%"} alignItems="center">
      {groupConsecutiveParts(parts).map((group, i) => (
        <box key={group.key} width="100%" paddingTop={i === 0 ? 0 : 1}>
          {group.parts.map((part, j) => {
            if (part.type === "reasoning") {
              return (
                <box
                  key={`reasoning-${j}`}
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
            if (isToolPart(part)) {
              const toolName =
                part.type === "dynamic-tool"
                  ? part.toolName
                  : part.type.slice("tool-".length);
              return (
                <box
                  key={(part as ClientToolCallPart).toolCallId}
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
                    <em fg={colors.info}>{formatToolName(toolName)}:</em>
                    {formatToolArgs(part as ClientToolCallPart)}
                    {(part as ClientToolCallPart).state !==
                      "output-available" &&
                    (part as ClientToolCallPart).state !== "output-error"
                      ? " ..."
                      : ""}
                    {(part as ClientToolCallPart).state === "output-error"
                      ? `${(part as ClientToolCallPart).errorText}`
                      : ""}
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
      <box paddingX={3} paddingY={1} gap={1} width={"100%"}>
        <box flexDirection="row" gap={2}>
          <text fg={mode === Mode.PLAN ? colors.planMode : colors.primary}>
            ◉
          </text>
          <box flexDirection="row" gap={1}>
            <text>{mode === Mode.PLAN ? "Plan" : "Build"}</text>
            <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
              &#8250;
            </text>
            <text attributes={TextAttributes.DIM}>{model}</text>
            {durationMs != null && (
              <>
                <text
                  attributes={TextAttributes.DIM}
                  fg={colors.dimSeparator}
                >
                  &#8250;
                </text>
                <text attributes={TextAttributes.DIM}>
                  {prettyMs(durationMs)}
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
