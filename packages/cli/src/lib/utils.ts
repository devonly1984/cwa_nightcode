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
import type { Message } from "../types/chatTypes";
import type { SupportedChatModelId } from "@nightcode/shared";
import prettyMs from "pretty-ms";

import { MessageStatus } from "@nightcode/database";

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
  DbMessages: SessionData["messages"],
): Message[] => {
  return DbMessages.map((m): Message => {
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
    return {
      id: m.id,
      role: "assistant",
      content: m.content,
      model: m.model as SupportedChatModelId,
      mode: m.mode,
      parts: [{ type: "text", text: m.content }],
      ...(m.duration != null
        ? { duration: prettyMs(m.duration * 1000) }
        : {}),
      interrupted: m.status === MessageStatus.INTERRUPTED,
    };
  });
};
