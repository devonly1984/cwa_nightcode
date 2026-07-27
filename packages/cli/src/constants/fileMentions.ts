export const MAX_VISIBLE_MENTIONS=8;
export const CURRENT_DIRECTORY=process.cwd();
export const MAX_FALLBACK_MENTION_CANDIDATES=32;
export const MENTION_QUERY_CHARACTER = /[A-Za-z0-9._/-]/;
export const RECURSIVE_MENTION_IGNORED_DIRECTORIES = new Set(["node_modules"])