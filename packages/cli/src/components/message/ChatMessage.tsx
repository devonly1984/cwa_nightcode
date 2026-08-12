import BotMessage from "./BotMessage";
import UserMessage from "./UserMessage";
import type { Message } from "../../types";

interface ChatMessageProps {
  msg: Message;
}

const ChatMessage = ({ msg }: ChatMessageProps) => {
  const text = msg.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("");
    if (msg.role==="user") {
        return (
          <UserMessage
            message={text}
            mode={msg.metadata?.mode ?? "BUILD"}
          />
        );
    } 
   
return (
  <BotMessage
    parts={msg.parts}
    model={msg.metadata?.model ?? "unknown"}
    mode={msg.metadata?.mode ?? "BUILD"}
    durationMs={msg.metadata?.durationMs}
    streaming={false}
  />
);
};
export default ChatMessage