import { TextAttributes } from "@opentui/core";
import { useTheme } from "../providers/theme/ThemeProvider";
import { EmptyBorder } from "../../constants/border";
interface Props {
  model:string;
  content:string;
}
const BotMessage = ({ model, content }: Props) => {
  const { colors } = useTheme();
  return (
    <box width={"100%"} alignItems="center">
      <box paddingY={1} width={"100%"}>
        <box paddingX={3} width={"100%"}>
          <text>{content}</text>
        </box>
      </box>
      <box paddingX={3} paddingBottom={1} gap={1} width={"100%"}>
        <box flexDirection="row" gap={2}>
          <text fg={colors.primary}>&#9673;</text>
          <text>{model}</text>
        </box>
      </box>
    </box>
  );
};
export default BotMessage;