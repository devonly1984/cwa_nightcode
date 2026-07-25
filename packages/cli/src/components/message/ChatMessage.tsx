import type { SessionData } from "../../types"
import BotMessage from "./BotMessage";
import ErrorMessage from "./ErrorMessage";
import UserMessage from "./UserMessage";
import prettyMs from 'pretty-ms';
import {
  DEFAULT_CHAT_MODEL_ID,
  type SupportedChatModelId,
} from "@nightcode/shared";
import { useChat } from "../../hooks/useChat";
import type { Message, ClientMessagePart } from "../../types/chatTypes";
interface ChatMessageProps {
  msg: Message;
}
const ChatMessage = ({ msg }: ChatMessageProps) => {
    if (msg.role==="user") {
        return <UserMessage message={msg.content} mode={msg.mode} />;
    } 
    if (msg.role === "error") {
      return <ErrorMessage message={msg.content} />;
    }
return (
  <BotMessage
    parts={msg.parts}
    model={msg.model}
    mode={msg.mode}
    duration={msg.duration}
    streaming={false}
    interrupted={msg.interrupted}
  />
);
};
export default ChatMessage