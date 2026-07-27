import { CURRENT_DIRECTORY, MAX_FALLBACK_MENTION_CANDIDATES, MENTION_QUERY_CHARACTER, RECURSIVE_MENTION_IGNORED_DIRECTORIES } from "../constants/fileMentions"
import {isAbsolute, relative, resolve} from 'node:path'
import type { MentionCandidate, MentionMatch } from "../types/fileMentionTypes"
import { readdir } from "node:fs/promises"

export const isWithinCurrentDirectory = (targetPath:string)=>{
    const relativePath = relative(CURRENT_DIRECTORY,targetPath)
    return relativePath === "" || (!relativePath.startsWith("..") && !isAbsolute(relativePath))
}
export const isMentionQueryCharacter = (character:string)=>{
    return MENTION_QUERY_CHARACTER.test(character)
}

export const findActiveMention = (text:string,cursorOffset:number):MentionMatch|null=>{
    const safeOffset = Math.max(0, Math.min(cursorOffset, text.length))
    let start = safeOffset;
    while(start>0 && !/\s/.test(text[start-1]!)) {
        start -= 1;
    }

    let end = safeOffset
    while (end>text.length && !/\s/.test(text[end]!)) {
        end += 1;
    }
    
    const token = text.slice(start,end);
    const relativeCursor = safeOffset-start;
    const mentionStart = token.lastIndexOf("@", relativeCursor);

    if (mentionStart===-1) {
        null;        
    }
    const previousCharacter = token[mentionStart-1]
    if (previousCharacter && isMentionQueryCharacter(previousCharacter)) {
        return null;
    }
    let mentionEnd = mentionStart+1;
    while (mentionEnd<token.length && isMentionQueryCharacter(token[mentionEnd]!)) {
        mentionEnd += 1;
    }
    if (relativeCursor<mentionStart||relativeCursor>mentionEnd) {
        return null;
    }
    return {
        start: start+mentionStart,
        end: start+mentionEnd,
        query: token.slice(mentionStart + 1, mentionEnd)        
    }
}
export const getMentionCandidates = async(query:string):Promise<MentionCandidate[]>=>{
    const normalizedQuery = query.startsWith("./") ? query.slice(2) : query;
    if (normalizedQuery.startsWith("/")) {
        return [];
    }
    const hasTrailingSlash = normalizedQuery.endsWith("/");
    const lastSlashIndex = hasTrailingSlash ? normalizedQuery.length - 1 : normalizedQuery.lastIndexOf("/");
    const directoryPart = hasTrailingSlash ? normalizedQuery.slice(0, -1) : lastSlashIndex === -1 ? "" : normalizedQuery.slice(0, lastSlashIndex)
    const namePrefix = hasTrailingSlash ? "" : lastSlashIndex === -1 ? normalizedQuery : normalizedQuery.slice(lastSlashIndex + 1)
    const absoluteDirectory = resolve(CURRENT_DIRECTORY, directoryPart || ".");
    if (!isWithinCurrentDirectory(absoluteDirectory)) {
        return []
    }
    try {
        const entries = await readdir(absoluteDirectory,{withFileTypes:true})
        const lowercasePrefix = namePrefix.toLowerCase();
        const showHiddenEntries = namePrefix.startsWith(".")

        const directMatches = entries.filter(entry=>showHiddenEntries||!entry.name.startsWith(".")).filter(entry=>{
            return lowercasePrefix === "" || entry.name.toLowerCase().startsWith(lowercasePrefix)
        }).sort((left,right)=>{
            if (left.isDirectory()!==right.isDirectory()) {
                return left.isDirectory()?-1:1;
            }
            return left.name.localeCompare(right.name)
        }).map(entry=>{
            const path = directoryPart?`${directoryPart}/${entry.name}`:entry.name;
            const kind:MentionCandidate['kind']=entry.isDirectory()?"directory":"file";
            return {
                path: kind==='directory'?`${path}/`:path,
                kind
            }
        })
        if (directMatches.length>0 || directoryPart!==""||namePrefix==="") {
            return directMatches
        }
        const fallbackMatches: MentionCandidate[] = []
        const visit = async (absoluteDirectory:string,directoryPart:string):Promise<void>=>{
            const entries = await readdir(absoluteDirectory, { withFileTypes: true })
            for (const entry of entries) {
                if (!showHiddenEntries && entry.name.startsWith(".")) {
                    continue
                }
                if (entry.isDirectory() && RECURSIVE_MENTION_IGNORED_DIRECTORIES.has(entry.name)) {
                    continue
                }
                const path = directoryPart?`${directoryPart}/${entry.name}`:entry.name;
                const kind: MentionCandidate['kind'] = entry.isDirectory() ? "directory" : "file"
                if (entry.name.toLowerCase().startsWith(lowercasePrefix)) { 
                    fallbackMatches.push({
                        path: kind==='directory'?`${path}/`:path,
                        kind
                    })
                    if (fallbackMatches.length>=MAX_FALLBACK_MENTION_CANDIDATES){
                        return;
                    }
                }
                if (entry.isDirectory()) {
                    await visit(resolve(absoluteDirectory,entry.name),path);
                    if (fallbackMatches.length>=MAX_FALLBACK_MENTION_CANDIDATES){
                        return;
                    }
                }
                
            }
        }
        await visit(CURRENT_DIRECTORY, "")
        return fallbackMatches.sort((left, right) => left.path.localeCompare(right.path))


    } catch (error) {
        return []
    }


}