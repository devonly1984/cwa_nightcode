import type { Command } from "../types";
import { COMMANDS } from "../constants/commands";
import {
  DEFAULT_THEME,
  THEMES,
  type Theme,
  type ThemePreferences,
} from "../components/providers/theme/types";
import { CONFIG_DIR, THEME_PREFERENCES_PATH } from "../constants/theme";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { ClientMessagePart, ClientToolCallPart,  PartGroup } from "../types/chatTypes";
import {  type ModeType,  } from "@nightcode/shared";
import prettyMs from 'pretty-ms'

import { Mode } from "@nightcode/shared";

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


 
  export const isToolPart = (part:ClientMessagePart)=>{
    return part.type === 'dynamic-tool' || part.type.startsWith("tool-")
  }


export const getModeLabel =(mode:ModeType)=>{
  return mode === Mode.PLAN ? "Plan" : "Build"
}
export const formatToolName = (name:string):string=>{
  return name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase())
}
export const formatToolArgs = (tc:ClientToolCallPart)=>{
  if (!("input" in tc) || tc.input==null) return "";
  if (typeof tc.input!=='object') return String(tc.input);
  return Object.values(tc.input).map(String).join(" ")

}

export const groupConsecutiveParts = (parts:ClientMessagePart[]):PartGroup[]=>{
  const groups:PartGroup[]=[];

  for (let i=0;i<parts.length;i++){
    const part = parts[i]!;
    const lastGroup = groups[groups.length-1];
    if (lastGroup && lastGroup.type===part?.type) {
      lastGroup.parts.push(part)
    } else {
      let key: string
      if (isToolPart(part) && "toolCallId" in part) {
        key = `group-tc-${(part as ClientToolCallPart).toolCallId}`
      } else {
        key = `group-${part.type}-${i}`
      }
      groups.push({ type: part.type, parts: [part], key })
    }

  }
  return groups;
}