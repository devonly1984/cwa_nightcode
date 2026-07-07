import { Outlet } from "react-router"
import {
  ToastProvider,
  ThemeProvider,
  DialogProvider,
  KeyboardLayerProvider,
} from "../../components/providers";
import ThemeRoot from "./ThemeRoot";
const RootLayout = () => {
  return (
    <ThemeProvider>
      <KeyboardLayerProvider>
        <DialogProvider>
          <ToastProvider>
            <ThemeRoot>
              <Outlet />
            </ThemeRoot>
          </ToastProvider>
        </DialogProvider>
      </KeyboardLayerProvider>
    </ThemeProvider>
  );
}
export default RootLayout