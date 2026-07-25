import type { Mode } from "@nightcode/database/enums";
import { createReadFileTool } from "./ReadFile";
import { createListDirectoryTool } from "./ListDirectory";
import { createWriteFileTool } from "./WriteFile";
import { createEditFileTool } from "./EditFile";
import { createGrepTool } from "./Grep";
import { createGlobTool } from "./Glob";
import { createBashTool } from "./bash";

export const createTools = (cwd: string, mode: Mode) => {
    const readOnlyTools = {
        readFile: createReadFileTool(cwd),
        listDirectory: createListDirectoryTool(cwd),
        grep: createGrepTool(cwd),
        glob: createGlobTool(cwd)
    }
    if (mode==="PLAN") {
        return readOnlyTools;
    }
    return {
        ...readOnlyTools,
        writeFile: createWriteFileTool(cwd),
        editFile:createEditFileTool(cwd),
        bash: createBashTool(cwd)
    }

}