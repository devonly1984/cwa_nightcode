import { TEXTAREA_KEY_BINDINGS } from "../../constants/bindings";
import { EmptyBorder } from "../../constants/border";
import { TextareaRenderable } from "@opentui/core";
import CommandMenu from "../menus/CommandMenu";
import StatusBar from "./StatusBar";
import { useRef, useCallback, useEffect } from "react";
import { useRenderer, useKeyboard } from "@opentui/react";
import { useCommandMenu } from "../../hooks/useCommandMenu";
import type { Command } from "../../types";
import { useToast } from "../providers/toast/ToastProvider";
import { useKeyboardLayer } from "../providers/keyboard/KeyboardProvider";
import { useDialog } from "../providers/dialog/DialogProvider";
import { useTheme } from "../providers/theme/ThemeProvider";
import { useNavigate } from "react-router";
import { usePromptConfig } from "../providers/prompt-config/PromptConfigProvider";
import { Mode } from "@nightcode/database/enums";
interface InputBarProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
}
const InputBar = ({ onSubmit, disabled = false }: InputBarProps) => {
  const { mode, toggleMode, setMode, setModel } = usePromptConfig();
  const textareaRef = useRef<TextareaRenderable>(null);
  const onSubmitRef = useRef<() => void>(() => {});
  const renderer = useRenderer();
  const navigate = useNavigate();
  const toast = useToast();
  const dialog = useDialog();
  const { isTopLayer, setResponder } = useKeyboardLayer();
  const {
    handleContentChange,
    resolveCommand,
    selectedIndex,
    showCommandMenu,
    commandQuery,
    scrollRef,
    setSelectedIndex,
  } = useCommandMenu();
 const {colors} = useTheme();
  const handleTextareaContentChange = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    handleContentChange(textarea.plainText);
  }, []);
  const handleSubmit = useCallback(() => {
    if (disabled) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = textarea.plainText.trim();
    if (text.length === 0) return;

    onSubmit(text);
    textarea.setText("");
  }, [disabled, onSubmit]);
  const handleCommand = useCallback(
    (command: Command | undefined) => {
      const textarea = textareaRef.current;
      if (!textarea || !command) return;
      textarea.setText("");
      if (command.action) {
        command.action({
          exit: () => renderer.destroy(),
          toast,
          dialog,
          navigate,
          mode,
          setMode,
          setModel,
        });
      } else {
        textarea.insertText(command.value + " ");
      }
    },

    [renderer, toast, dialog, navigate, mode, setMode, setModel],
  );
   const handleCommandExecute = useCallback(
     (index: number) => {
       const command = resolveCommand(index);
       handleCommand(command);
     },
     [resolveCommand, handleCommand],
   );
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.onSubmit = () => {
      onSubmitRef.current();
    };
  }, []);

  onSubmitRef.current = () => {
    if (disabled) return;
    if (showCommandMenu) {
      const command = resolveCommand(selectedIndex);
      handleCommand(command);
      return;
    }
    handleSubmit();
  };

  useKeyboard(key=>{
    if (disabled) return;
    if (!isTopLayer('base'))return;
    if (key.name==='tab') {
      key.preventDefault();
      toggleMode();
    }
  })
  useEffect(() => {
    setResponder("base", () => {
      if (disabled) return false;
      const textarea = textareaRef.current;
      if (textarea && textarea.plainText.length > 0) {
        textarea.setText("");
        return true;
      }
      return false;
    });
    return () => setResponder("base", null);
  }, [disabled, setResponder]);

  return (
    <box width="100%" alignItems="center">
      <box
        border={["left"]}
        borderColor={
          mode === Mode.BUILD ? colors.primary : colors.planMode
        }
        customBorderChars={{
          ...EmptyBorder,
          vertical: "┃",
          bottomLeft: "┃",
        }}
        width="100%"
      >
        <box
          position="relative"
          justifyContent="center"
          paddingX={2}
          paddingY={1}
          backgroundColor={colors.surface}
          width="100%"
          gap={1}
        >
          {showCommandMenu && (
            <box
              position="absolute"
              bottom="100%"
              left={0}
              width="100%"
              backgroundColor={colors.surface}
              zIndex={10}
            >
              <CommandMenu
                query={commandQuery}
                selectedIndex={selectedIndex}
                scrollRef={scrollRef}
                onSelect={setSelectedIndex}
                onExecute={handleCommandExecute}
              />
            </box>
          )}
          <textarea
            ref={textareaRef}
            focused={
              !disabled && (isTopLayer("base") || isTopLayer("commands"))
            }
            keyBindings={TEXTAREA_KEY_BINDINGS}
            onContentChange={handleTextareaContentChange}
            placeholder={`Ask anything... "Fix a bug in the database."`}
          />
          <StatusBar />
        </box>
      </box>
    </box>
  );
};
export default InputBar;
