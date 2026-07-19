import { Outlet } from "react-router"
import {
  ToastProvider,
  ThemeProvider,
  DialogProvider,
  KeyboardLayerProvider,
  PromptConfigProvider,
} from "../../components/providers";
import ThemeRoot from "./ThemeRoot";
const RootLayout = () => {
  return (
    <ThemeProvider>
      <KeyboardLayerProvider>
        <DialogProvider>
          <ToastProvider>
            <PromptConfigProvider>
              <ThemeRoot>
                <Outlet />
              </ThemeRoot>
            </PromptConfigProvider>
          </ToastProvider>
        </DialogProvider>
      </KeyboardLayerProvider>
    </ThemeProvider>
  );
}
export default RootLayout