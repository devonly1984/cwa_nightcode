import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import type { ToastContextValue, ToastOptions } from "../toast/types";
import { DEFAULT_DURATION } from "../../../constants/toast";
import Toast from "./Toast";
interface ToastProviderProps {
  children: ReactNode;
}

const ToastContext = createContext<ToastContextValue | null>(null);
export const useToast = (): ToastContextValue => {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("useToast must be used inside  ToastProvider");
  }
  return value;
};
export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [currentToast, setCurrentToast] = useState<ToastOptions | null>(
    null,
  );
  const timeoutHandleRef = useRef<NodeJS.Timeout | null>(null);
  const clearCurrentTimeout = useCallback(() => {
    if (timeoutHandleRef.current) {
      clearTimeout(timeoutHandleRef.current);
      timeoutHandleRef.current = null;
    }
  }, []);
  const show = useCallback(
    (options: ToastOptions) => {
      const duration = options.duration ?? DEFAULT_DURATION;
      clearCurrentTimeout();
      setCurrentToast({
        variant: options.variant ?? "info",
        ...options,
        duration,
      });
      timeoutHandleRef.current = setTimeout(() => {
        setCurrentToast(null);
      }, duration).unref();
    },
    [clearCurrentTimeout],
  );
  const value: ToastContextValue = {
    show,
  };
  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast currentToast={currentToast} />
    </ToastContext.Provider>
  );
};
