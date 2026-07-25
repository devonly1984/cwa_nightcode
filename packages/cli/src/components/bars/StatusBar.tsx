import { TextAttributes } from "@opentui/core"
import { useTheme } from "../providers/theme/ThemeProvider";
import { usePromptConfig } from "../providers/prompt-config/PromptConfigProvider";
import { Mode } from "@nightcode/database/enums";

const StatusBar = () => {
  const { mode, model } = usePromptConfig();
  const { colors } = useTheme();
  return (
    <box flexDirection="row" gap={1}>
      <text fg={mode === Mode.PLAN ? colors.planMode : colors.primary}>
        {mode === Mode.PLAN ? "Plan" : "Build"}
      </text>
      <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
        &#8250;
      </text>
      <text>{model}</text>
    </box>
  );
}
export default StatusBar