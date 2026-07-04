import InputBar from "../bars/InputBar"
import Header from "../layout/Header"
import { useTheme } from "../providers/theme/ThemeProvider"

const ThemeRoot = () => {
    const { colors } = useTheme();

  return (
    <box
      alignItems="center"
      justifyContent="center"
      backgroundColor={colors.background}
      width="100%"
      height="100%"
      gap={2}
    >
      <Header />
      <box width={"100%"} maxWidth={78} paddingX={2}>
        <InputBar onSubmit={() => {}} />
      </box>
    </box>
  );
}
export default ThemeRoot