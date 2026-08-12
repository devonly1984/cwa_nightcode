import { useTheme } from "../providers/theme/ThemeProvider";
import { EmptyBorder } from "../../constants/border";
import { Mode, type ModeType } from "@nightcode/shared";
interface Props {
  message: string;
  mode: ModeType;
}
const UserMessage = ({ message,mode }: Props) => {
  const { colors } = useTheme();
  return (
    <box width={"100%"} alignItems="center">
      <box
        border={["left"]}
        borderColor={mode === Mode.PLAN ? colors.planMode : colors.primary}
        width={"100%"}
        customBorderChars={{
          ...EmptyBorder,
          vertical: "┃",
          bottomLeft: "┃",
        }}
      >
        <box
          justifyContent="center"
          paddingX={2}
          paddingY={1}
          borderColor={colors.surface}
          width={"100%"}
        >
          <text>{message}</text>
        </box>
      </box>
    </box>
  );
};
export default UserMessage;