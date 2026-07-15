import { TextAttributes } from "@opentui/core";
import { useTheme } from "../providers/theme/ThemeProvider";
import { EmptyBorder } from "../../constants/border";
import type { ClientMessagePart } from "../../types/chatTypes";
import { Mode } from "@nightcode/database/enums";
interface Props {
  model: string;
  parts: ClientMessagePart[];
  mode:Mode;
  duration?:string;
  streaming?:boolean;
  interrupted?:boolean;

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
  const text = parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("");
  return (
    <box width={"100%"} alignItems="center">
      <box paddingY={1} width={"100%"}>
        <box paddingX={3} width={"100%"}>
          <text>{text}</text>
        </box>
      </box>
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