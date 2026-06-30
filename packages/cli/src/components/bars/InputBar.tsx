import { TEXTAREA_KEY_BINDINGS } from "../../constants/bindings";
import { EmptyBorder } from "../../constants/border";
import { TextareaRenderable } from "@opentui/core";
import CommandMenu from "../menus/CommandMenu";
import StatusBar from "./StatusBar";
import { useRef, useCallback, useEffect } from "react";
import { useRenderer } from "@opentui/react";
import { useCommandMenu } from "../../hooks/useCommandMenu";
import type { Command } from "../../types";
interface InputBarProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
}
const InputBar = ({ onSubmit, disabled = false }: InputBarProps) => {
  const textareaRef = useRef<TextareaRenderable>(null);
  const onSubmitRef = useRef<() => void>(() => {});
  const renderer = useRenderer();
  const {
    handleContentChange,
    resolveCommand,
    selectedIndex,
    showCommandMenu,
    commandQuery,
    scrollRef,
    setSelectedIndex,
  } = useCommandMenu();
 
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
        });
      } else {
        textarea.insertText(command.value + " ");
      }
    },

    [renderer],
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
  return (
    <box width="100%" alignItems="center">
      <box
        border={["left"]}
        borderColor={"cyan"}
        customBorderChars={{
          ...EmptyBorder,
          vertical: "┃",
          bottomLeft: "┃",
        }}
      >
        <box
          position="relative"
          justifyContent="center"
          paddingX={2}
          paddingY={1}
          backgroundColor={"#1a1a24"}
          width={"100%"}
          gap={1}
        >
          {showCommandMenu && (
            <box
              position="absolute"
              bottom="100%"
              left={0}
              width="100%"
              backgroundColor="#1a1a24"
              zIndex={10}
            >
              <CommandMenu
                query=""
                selectedIndex={selectedIndex}
                scrollRef={scrollRef}
                onSelect={setSelectedIndex}
                onExecute={handleCommandExecute}
              />
            </box>
          )}
          <textarea
            ref={textareaRef}
            focused={!disabled}
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
