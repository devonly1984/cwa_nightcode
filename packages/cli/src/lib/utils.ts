import type { Command } from "../types";
import { COMMANDS } from "../constants/commands";
import { DEFAULT_THEME, THEMES, type Theme, type ThemePreferences } from "../components/providers/theme/types"
import { CONFIG_DIR, THEME_PREFERENCES_PATH } from "../constants/theme";
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

export const getFilteredCommands = (query: string): Command[] => {
    if (query.length === 0) return COMMANDS;
    return COMMANDS.filter((cmd) => cmd.name.toLowerCase().startsWith(query.toLowerCase()))
}

export const getInitialTheme = ():Theme=>{
try{
    const preferences = JSON.parse(readFileSync(THEME_PREFERENCES_PATH, "utf8")) as Partial<ThemePreferences>;
    const savedTheme = THEMES.find(t => t.name === preferences.themeName);
    return savedTheme ?? DEFAULT_THEME;
}
catch{
    return DEFAULT_THEME;
}
}

export const persistTheme = (theme:Theme)=>{
try{
    mkdirSync(CONFIG_DIR, { recursive: true });
    writeFileSync(THEME_PREFERENCES_PATH, JSON.stringify({ themeName: theme.name } satisfies ThemePreferences, null, 2), 'utf8');
    
}
catch{


}
}