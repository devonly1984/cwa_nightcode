import type { ReactNode } from "react"

import { useTheme } from "../../components/providers/theme/ThemeProvider";
interface ThemeRootProps {
  children: ReactNode;
}
const ThemeRoot = ({ children }: ThemeRootProps) => {
  const { colors } = useTheme();

  return (
    <box
      backgroundColor={colors.background}
      width={"100%"}
      height={"100%"}
      flexGrow={1}
    >
      {children}
    </box>
  );
};
export default ThemeRoot