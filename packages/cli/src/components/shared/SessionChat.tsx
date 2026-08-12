import { useEffect, useRef, useState } from "react";
import SessionShell from "../session/SessionShell";
import { useChat } from "../../hooks/useChat";

import type { SessionData, Message } from "../../types";

import {  ChatMessage, ErrorMessage } from "../message";
import { useKeyboardLayer } from "../providers/keyboard/KeyboardProvider";
import { useKeyboard } from "@opentui/react";
import { usePromptConfig } from "../providers/prompt-config/PromptConfigProvider";
import type { SupportedChatModelId, ModeType } from "@nightcode/shared";
export const SessionChat = ({ session,
  initialPrompt
 }: { session: SessionData,
  initialPrompt?:{message:string;mode:ModeType;model:SupportedChatModelId}
  }) => {
    const [initialMessages] = useState(
      () => session?.messages as unknown as Message[],
    );

    const { mode, model } = usePromptConfig();
    const { isTopLayer } = useKeyboardLayer();
    const { messages, status, submit, abort, interrupt, error } = useChat(
      session!.id,
      initialMessages,
    );
    const hasSubmittedIntialPromptRef = useRef(false);
    useEffect(() => {
      return () => void abort();
    }, [abort]);

    useKeyboard((key) => {
      if (
        key.name === "escape" &&
        isTopLayer("base") &&
        status === "streaming"
      ) {
        key.preventDefault();
        interrupt();
      }
    });
    useEffect(() => {
      if (!initialPrompt || hasSubmittedIntialPromptRef.current) return;
      void submit({
        userText: initialPrompt.message,
        mode: initialPrompt.mode,
        model: initialPrompt.model,
      });
    }, [initialPrompt, submit]);
    return (
      <SessionShell
        onSubmit={(text) =>
          submit({
            userText: text,
            mode,
            model,
          })
        }
        loading={status === "streaming" || status === "submitted"}
        interruptible={status === "streaming" || status === "submitted"}
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} />
        ))}
        {error && <ErrorMessage message={error.message} />}
      </SessionShell>
    );
  };
