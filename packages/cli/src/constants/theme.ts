
import {homedir} from 'node:os';
import { join } from "node:path";
export const CONFIG_DIR = join(homedir(), ".nightcode");
export const THEME_PREFERENCES_PATH = join(CONFIG_DIR, "preferences.json");