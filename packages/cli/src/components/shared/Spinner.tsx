import "opentui-spinner/react";
import { useTheme } from "../providers/theme/ThemeProvider";
const Spinner = () => {
    const {colors} = useTheme()
  return <spinner name="aesthetic" color={colors.primary} />;
}
export default Spinner