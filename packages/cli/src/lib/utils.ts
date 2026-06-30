import type { Command } from "../types";
import { COMMANDS } from "../constants/commands";


export const getFilteredCommands = (query: string): Command[] => {
    if (query.length === 0) return COMMANDS;
    return COMMANDS.filter((cmd) => cmd.name.toLowerCase().startsWith(query.toLowerCase()))
}