
import {type ReactNode,createContext,useContext,useState,useCallback} from 'react'
import type { Theme, ThemeContextValue } from "../theme/types";
import { getInitialTheme, persistTheme } from '../../../lib/utils';

const ThemeContext = createContext<ThemeContextValue | null>(null);
interface ThemeProviderProps {
  children: ReactNode;
}
const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [currentTheme, setCurrentTheme] = useState<Theme>(getInitialTheme)
    const setTheme = useCallback((theme: Theme) => {
      setCurrentTheme(theme);
      persistTheme(theme);
    }, []);
  return (
    <ThemeContext.Provider
      value={{
        colors: currentTheme.colors,
        currentTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = ():ThemeContextValue=>{
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
export default ThemeProvider