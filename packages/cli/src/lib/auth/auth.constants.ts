import { homedir } from 'node:os';
import {join} from 'node:path';

export const AUTH_DIR=join(homedir(),'.nightcode')
export const AUTH_FILE = join(AUTH_DIR, "auth.json")
export const LOGIN_TIMEOUT_MS = 5 * 60 * 1000