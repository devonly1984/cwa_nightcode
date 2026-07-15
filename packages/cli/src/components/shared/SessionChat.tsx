import { useEffect, useState } from "react";
import SessionShell from "../session/SessionShell";
import { useChat } from "../../hooks/useChat";
import { mapDbMessages } from "../../lib/utils";
import type { SessionData } from "../../types";
import { DEFAULT_CHAT_MODEL_ID } from "@nightcode/shared";
import { BotMessage, ChatMessage } from "../message";
import { useKeyboardLayer } from "../providers/keyboard/KeyboardProvider";
import { useKeyboard } from "@opentui/react";
export const SessionChat = ({ session }: { session: SessionData }) => {
  const [initialMessages] = useState(() =>
    mapDbMessages(session.messages),
  );
  const { messages, streaming, submit, abort, interrrupt } = useChat(
    session.id,
    initialMessages,
  );
  const { isTopLayer } = useKeyboardLayer();
  useEffect(() => {
    return () => abort();
  }, [abort]);
  useKeyboard((key) => {
    if (
      key.name === "escape" &&
      isTopLayer("base") &&
      streaming.status === "streaming"
    ) {
      key.preventDefault();
      interrrupt();
    }
  });
  return (
    <SessionShell
      onSubmit={(text) =>
        submit({
          userText: text,
          mode: "BUILD",
          model: DEFAULT_CHAT_MODEL_ID,
        })
      }
      loading={streaming.status === "streaming"}
      interruptible={streaming.status === "streaming"}
    >
      {messages.map((msg) => (
        <ChatMessage key={msg.id} msg={msg} />
      ))}
      {streaming.status === "streaming" && streaming.parts.length > 0 && (
        <BotMessage
          parts={streaming.parts}
          model={streaming.model}
          mode={streaming.mode}
          streaming
        />
      )}
    </SessionShell>
  );
};
