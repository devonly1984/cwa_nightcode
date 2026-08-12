import {createContext,useContext,useState,useCallback,type ReactNode} from 'react'
import {
  DEFAULT_CHAT_MODEL_ID,
  type SupportedChatModelId,
  Mode,type ModeType
} from "@nightcode/shared";
import { type PromptConfigContextValue } from './types'




const PromptConfigContext = createContext<PromptConfigContextValue | null>(
  null,
);
type PromptConfigProviderProps={
    children:ReactNode;
}
export const usePromptConfig = ():PromptConfigContextValue => {
    const value = useContext(PromptConfigContext);
    if (!value) {
        throw new Error("usePromptConfig must be used within a PromptConfigProvider")
    }
  return value
}

const PromptConfigProvider = ({children}:PromptConfigProviderProps)=>{
    const [mode, setMode] = useState<ModeType>(Mode.PLAN);
    const [model, setModel] = useState<SupportedChatModelId>(
      DEFAULT_CHAT_MODEL_ID,
    );
    const toggleMode = useCallback(()=>{
        setMode((m) => (m === Mode.BUILD ? Mode.PLAN : Mode.BUILD));
    },[])
    return (
      <PromptConfigContext.Provider
        value={{ mode, toggleMode, setMode, model, setModel }}
      >
        {children}
      </PromptConfigContext.Provider>
    );
}

export default PromptConfigProvider;