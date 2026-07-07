import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import type { DialogConfig, DialogContextType } from "./types";
import { useKeyboardLayer } from "../keyboard/KeyboardProvider";
import Dialog from "./Dialog";

const DialogContext = createContext<DialogContextType | null>(null);

export const useDialog = (): DialogContextType => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};

interface DialogProviderProps {
  children: ReactNode;
}

 const DialogProvider = ({ children }: DialogProviderProps) => {
  const [currentDialog, setCurrentDialog] = useState<DialogConfig | null>(
    null,
  );
  const { push, pop } = useKeyboardLayer();
  const close = useCallback(() => {
    setCurrentDialog(null);
    pop("dialog");
  }, [pop]);
  const open = useCallback(
    (config: DialogConfig) => {
      setCurrentDialog(config);
      push("dialog", () => {
        close();
        return true;
      });
    },
    [push, close],
  );
  const value: DialogContextType = {
    open,
    close,
  };
  return (
    <DialogContext.Provider value={value}>
      {children}
      <Dialog currentDialog={currentDialog} close={close} />
    </DialogContext.Provider>
  );
};
export default DialogProvider;