import type { Command, SessionData } from "../types";
import { COMMANDS } from "../constants/commands";
import {
  DEFAULT_THEME,
  THEMES,
  type Theme,
  type ThemePreferences,
} from "../components/providers/theme/types";
import { CONFIG_DIR, THEME_PREFERENCES_PATH } from "../constants/theme";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { ClientMessagePart, ClientToolCallPart, Message, PartGroup } from "../types/chatTypes";
import { messagePartsSchema, type SupportedChatModelId } from "@nightcode/shared";
import prettyMs from "pretty-ms";

import { MessageStatus, Mode } from "@nightcode/database/enums";

export const getFilteredCommands = (query: string): Command[] => {
  if (query.length === 0) return COMMANDS;
  return COMMANDS.filter((cmd) =>
    cmd.name.toLowerCase().startsWith(query.toLowerCase()),
  );
};

export const getInitialTheme = (): Theme => {
  try {
    const preferences = JSON.parse(
      readFileSync(THEME_PREFERENCES_PATH, "utf8"),
    ) as Partial<ThemePreferences>;
    const savedTheme = THEMES.find(
      (t) => t.name === preferences.themeName,
    );
    return savedTheme ?? DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

export const persistTheme = (theme: Theme) => {
  try {
    mkdirSync(CONFIG_DIR, { recursive: true });
    writeFileSync(
      THEME_PREFERENCES_PATH,
      JSON.stringify(
        { themeName: theme.name } satisfies ThemePreferences,
        null,
        2,
      ),
      "utf8",
    );
  } catch {}
};

export const mapDbMessages = (
  dbMessages: SessionData["messages"],
): Message[] => {
  return dbMessages.map((m): Message => {
    if (m.role === "ERROR") {
      return { id: m.id, role: "error", content: m.content };
    }
    if ((m.role = "USER")) {
      return {
        id: m.id,
        role: "user",
        content: m.content,
        mode: m.mode,
        model: m.model as SupportedChatModelId,
      };
      
    }
    const parsedParts = m.parts == null ? null : messagePartsSchema.safeParse(m.parts)
    const parts: ClientMessagePart[] = parsedParts?.success ? parsedParts.data.map((p) => p.type === 'tool-call' ? { ...p, status: "done" as const } : p)
      :[]

    return {
      id: m.id,
      role: "assistant",
      content: m.content,
      model: m.model as SupportedChatModelId,
      mode: m.mode,
      parts,
      ...(m.duration != null
        ? { duration: prettyMs(m.duration * 1000) }
        : {}),
      interrupted: m.status === MessageStatus.INTERRUPTED,
    };
  });
};

export const getModeLabel =(mode:Mode)=>{
  return mode === Mode.PLAN ? "Plan" : "Build"
}
export const formatToolName = (name:string):string=>{
  return name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase())
}
export const formatToolArgs = (toolCall:ClientToolCallPart):string=>{
  return Object.values(toolCall.args).map(String).join(" ")
}

export const groupConsecutiveParts = (parts:ClientMessagePart[]):PartGroup[]=>{
  const groups:PartGroup[]=[];

  for (let i=0;i<parts.length;i++){
    const part = parts[i]!;
    const lastGroup = groups[groups.length-1];
    if (lastGroup && lastGroup.type===part?.type) {
      lastGroup.parts.push(part)
    } else {
      const key = part.type === 'tool-call' ? `group-tc-${part.id}` : `group-${part.type}-${i}`
      groups.push({ type: part.type, parts: [part], key })
    }

  }
  return groups;
}