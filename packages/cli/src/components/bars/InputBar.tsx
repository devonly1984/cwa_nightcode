import { readdir } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import { TEXTAREA_KEY_BINDINGS } from "../../constants/bindings";
import { EmptyBorder } from "../../constants/border";
import {
  type TextareaRenderable,
  ScrollBoxRenderable,
} from "@opentui/core";
import CommandMenu from "../menus/CommandMenu";
import StatusBar from "./StatusBar";
import {
  useRef,
  useCallback,
  useEffect,
  useState,
  type RefObject,
} from "react";
import { TextAttributes } from "@opentui/core";
import { useRenderer, useKeyboard } from "@opentui/react";
import { useCommandMenu } from "../../hooks/useCommandMenu";
import type { Command } from "../../types";
import { useToast } from "../providers/toast/ToastProvider";
import { useKeyboardLayer } from "../providers/keyboard/KeyboardProvider";
import { useDialog } from "../providers/dialog/DialogProvider";
import { useTheme } from "../providers/theme/ThemeProvider";
import { useNavigate } from "react-router";
import { usePromptConfig } from "../providers/prompt-config/PromptConfigProvider";
import { Mode } from "@nightcode/shared";
import type {
  MentionCandidate,
  MentionMatch,
} from "../../types/fileMentionTypes";
import { findActiveMention, getMentionCandidates } from "../../lib/fileMentionLib";
import FileMention from "../shared/FileMention";
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
  const { isTopLayer, push, pop, setResponder } = useKeyboardLayer();
  const [activeMention, setActiveMention] = useState<MentionMatch | null>(
    null,
  );
  const [mentionCandidates, setMentionCandidates] = useState<
    MentionCandidate[]
  >([]);
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0);
  const {
    handleContentChange,
    resolveCommand,
    selectedIndex,
    showCommandMenu,
    commandQuery,
    scrollRef,
    setSelectedIndex,
  } = useCommandMenu();
  const showMentionMenu = activeMention !== null;

  const { colors } = useTheme();
  const activeMentionRef = useRef<MentionMatch | null>(null);
  const mentionScrollRef = useRef<ScrollBoxRenderable>(null);
  const closeMentionMenu = useCallback(() => {
    activeMentionRef.current = null;
    setActiveMention(null);
    setMentionCandidates([]);
    pop("mention");
  }, [pop]);
  const syncMentionMenu = useCallback(
    (text: string, cursorOffset: number) => {
      const nextMention = findActiveMention(text, cursorOffset);
      const previousMention = activeMentionRef.current;
      const mentionChanged =
        previousMention?.start !== nextMention?.start ||
        previousMention?.end !== nextMention?.end ||
        previousMention?.query !== nextMention?.query;
      if (!nextMention) {
        if (previousMention) {
          closeMentionMenu();
        }
        return;
      }
      activeMentionRef.current = nextMention;
      setActiveMention(nextMention);
      push("mention", () => {
        closeMentionMenu();
        return true;
      });
      if (mentionChanged) {
        setMentionSelectedIndex(0);
        mentionScrollRef.current?.scrollTo(0);
      }
    },
    [closeMentionMenu, push],
  );
  const handleTextareaContentChange = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const text = textarea.plainText;
    handleContentChange(textarea.plainText);
    syncMentionMenu(text, textarea.cursorOffset);
  }, [handleContentChange, syncMentionMenu]);
  const handleMentionExecute = useCallback(
    (index: number) => {
      const textarea = textareaRef.current;
      const mention = activeMentionRef.current;
      const candidate = mentionCandidates[index];
      if (!textarea || !mention || !candidate) return;
      const insertion =
        candidate.kind === "directory"
          ? candidate.path
          : `${candidate.path} `;

      const newText = `${textarea.plainText.slice(0, mention.start)}@${insertion}${textarea.plainText.slice(mention.end)}`;
      textarea.replaceText(newText);
      textarea.cursorOffset = mention.start + insertion.length + 1;
      syncMentionMenu(newText, textarea.cursorOffset);
    },
    [mentionCandidates, syncMentionMenu],
  );
  const handleTextAreaCursorChange = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    syncMentionMenu(textarea.plainText, textarea.cursorOffset);
  }, [syncMentionMenu]);


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
    if (!activeMention) {
      setMentionCandidates([]);
      return;
      
    }
    let ignore =false;
    const loadCandidates = async()=>{
      const nextCandidates = await getMentionCandidates(
        activeMention.query,
      );
      if (ignore) return;
      setMentionCandidates(nextCandidates);
      setMentionSelectedIndex(prev=>{
        if (nextCandidates.length===0){
          return 0;
        }
        return Math.min(prev, nextCandidates.length - 1);
      })
    }
    void loadCandidates();
    return ()=>{
      ignore = true;
    }
  }, [activeMention]);
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
    if (showMentionMenu) {
      const candidate = mentionCandidates[mentionSelectedIndex];
      if (candidate) {
        handleMentionExecute(mentionSelectedIndex);
        return;
      }

    }

    handleSubmit();
  };

  useKeyboard((key) => {
    if (disabled) return;
    if (!isTopLayer("base")) return;
    if (key.name === "tab") {
      key.preventDefault();
      toggleMode();
    }
  });
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
  useKeyboard((key)=>{
    if (disabled) return;
    if (!showMentionMenu||!isTopLayer('mention')) return;
    if (key.name==='escape') {
      key.preventDefault();
      closeMentionMenu()
    } else if (key.name==='up'){
      key.preventDefault();
      setMentionSelectedIndex(current=>{
        const nextIndex = Math.max(0,current-1);
        const scrollbox = mentionScrollRef.current;
        if (scrollbox && nextIndex<scrollbox.scrollTop){
          scrollbox.scrollTo(nextIndex)
        }
        return nextIndex;
      })
    } else if (key.name==='down') {
      key.preventDefault();
      setMentionSelectedIndex(current=>{
        if (mentionCandidates.length===0) {
          return 0;
        }
        const nextIndex = Math.min(
          mentionCandidates.length - 1,
          current + 1,
        );
        const scrollbox = mentionScrollRef.current;
        if (scrollbox) {
          const viewportHeight = scrollbox.viewport.height;
          const visibleEnd = scrollbox.scrollTop + viewportHeight-1;
          if (nextIndex > visibleEnd) {
            scrollbox.scrollTo(nextIndex - viewportHeight + 1);
          }

        }
        return nextIndex;
      })
    }
    
  })
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
          {!showCommandMenu && showMentionMenu && (
            <box
              position="absolute"
              bottom="100%"
              left={0}
              width="100%"
              backgroundColor={colors.surface}
              zIndex={10}
            >
              <FileMention
                candidates={mentionCandidates}
                selectedIndex={mentionSelectedIndex}
                scrollRef={mentionScrollRef}
                onSelect={setMentionSelectedIndex}
                onExecute={handleMentionExecute}
              />
            </box>
          )}
          <textarea
            ref={textareaRef}
            focused={
              !disabled &&
              (isTopLayer("base") ||
                isTopLayer("commands") ||
                isTopLayer("mention"))
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
