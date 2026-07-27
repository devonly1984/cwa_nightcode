import type { ScrollBoxRenderable } from "@opentui/core";
import type { RefObject } from "react";

export type MentionMatch = {
    start:number;
    end:number;
    query:string;
}

export type MentionCandidate= {
    path:string;
    kind: "file" | "directory"
}

export type FileMentionMenuProps ={
    candidates:MentionCandidate[];
    selectedIndex:number;
    scrollRef:RefObject<ScrollBoxRenderable|null>;
    onSelect:(index:number)=>void;
    onExecute: (index: number) => void;
}