import { createCliRenderer,  } from "@opentui/core";
import { createRoot } from "@opentui/react";

import { ToastProvider } from "./components/providers/toast/ToastProvider";
import { KeyboardLayerProvider } from "./components/providers/keyboard/KeyboardProvider";
import { DialogProvider } from "./components/providers/dialog/DialogProvider";
import ThemeProvider from "./components/providers/theme/ThemeProvider";
import ThemeRoot from "./components/shared/ThemeRoot";

const App = () => {
  return (
    <ThemeProvider>
      <KeyboardLayerProvider>
        <DialogProvider>
          <ToastProvider>
            <ThemeRoot />
          </ToastProvider>
        </DialogProvider>
      </KeyboardLayerProvider>
    </ThemeProvider>
  );
};

const renderer = await createCliRenderer({
  targetFps: 60,
  exitOnCtrlC: false,
});
createRoot(renderer).render(<App />);
