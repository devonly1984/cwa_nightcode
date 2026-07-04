import { useTerminalDimensions } from "@opentui/react";
import type { ToastOptions, ToastVariant } from "../toast/types"

import { SplitBorderChars } from "../../../constants/border";
import { useTheme } from "../theme/ThemeProvider";
interface ToastProps  {
    currentToast: ToastOptions|null;
}

const Toast = ({ currentToast }: ToastProps) => {
    const {width} = useTerminalDimensions();
    const { colors } = useTheme();
   const variantColors: Record<ToastVariant, string> = {
     success: colors.success,
     error: colors.error,
     info: colors.info,
   };
    if (!currentToast) {
        return null;
    }
    const borderColor = currentToast.variant
      ? variantColors[currentToast.variant]
      : variantColors.info;

  return (
    <box
      position="absolute"
      justifyContent="center"
      alignItems="flex-start"
      top={2}
      right={2}
      width={Math.max(1, Math.min(60, width - 6))}
      paddingLeft={2}
      paddingRight={2}
      paddingTop={1}
      paddingBottom={1}
      backgroundColor={colors.surface}
      borderColor={borderColor}
      border={["left", "right"]}
      customBorderChars={{ ...SplitBorderChars }}
    >
      <box flexDirection="column" gap={1} width="100%">
        <text fg={"#e1e1e1"} wrapMode="word" width="100%">
          {currentToast.message}
        </text>
      </box>
    </box>
  );
};
export default Toast