import { useTheme } from "../providers/theme/ThemeProvider";
import { EmptyBorder } from "../../constants/border";
interface Props {
  message:string;
}
const UserMessage = ({ message }: Props) => {
  const { colors } = useTheme();
  return (
    <box width={"100%"} alignItems="center">
      <box
        border={["left"]}
        borderColor={colors.primary}
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
          <text >{message}</text>
        </box>
      </box>
    </box>
  );
};
export default UserMessage;