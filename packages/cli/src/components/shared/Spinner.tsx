import "opentui-spinner/react";
import { useTheme } from "../providers/theme/ThemeProvider";
import { Mode,type ModeType } from "@nightcode/shared";
type Props = {
  mode?: ModeType;
};
const Spinner = ({ mode = Mode.BUILD }: Props) => {
  const { colors } = useTheme();
  const activeColor =
    mode === Mode.PLAN ? colors.planMode : colors.primary;
  return <spinner name="aesthetic" color={activeColor} />;
};
export default Spinner;
