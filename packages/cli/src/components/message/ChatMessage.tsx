import type { SessionData } from "../../types"
import BotMessage from "./BotMessage";
import ErrorMessage from "./ErrorMessage";
import UserMessage from "./UserMessage";

interface ChatMessageProps {
  msg: SessionData["messages"][number];
}
const ChatMessage = ({ msg }: ChatMessageProps) => {
    if (msg.role==="USER") {
        return <UserMessage message={msg.content} />;
    } 
    if (msg.role==='ERROR') {
        return <ErrorMessage message={msg.content}/>
    }
return <BotMessage content={msg.content} model={msg.model} />;
};
export default ChatMessage