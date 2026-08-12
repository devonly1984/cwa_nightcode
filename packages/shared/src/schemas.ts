import { z } from 'zod';
import { tool } from 'ai'


export const Mode = {
    BUILD: "BUILD",
    PLAN: "PLAN"
} as const;

export const modeSchema = z.enum([Mode.BUILD, Mode.PLAN]);
export type ModeType = (typeof Mode)[keyof typeof Mode];
export const toolInputSchemas = {
    readFile: z.object({
        path: z.string().describe("Relative path to the file to read")
    }),
    listDirectory: z.object({
        path: z.string().describe("Relative path to the directory to list")
    }),
    glob: z.object({
        pattern: z.string().describe("Glob pattern to match files"),
        path: z.string().default(".").describe("Directory to search from")
    }),
    grep: z.object({
        pattern: z.string().describe("Regex pattern to match files"),
        path: z.string().default(".").describe("Directory to search from"),
        include: z.string().optional().describe("Optional glob pattern to include files"),
    }),
    writeFile: z.object({
        path: z.string().describe("Relative path  to write"),
        content: z.string().describe("Content to write to the file")
    }),
    editFile: z.object({
        path: z.string().describe("Relative path to the file to edit"),
        oldString: z.string().describe("String to replace in the file"),
        newString: z.string().describe("String to replace with in the file")
    }),
    bash: z.object({
        command: z.string().describe("Bash command to execute"),
        description: z.string().optional().describe("Optional description of the command"),
        timeout: z.number().optional().describe("Timeout in milliseconds ")
    })
} as const;

export const readOnlyToolContracts = {
    readFile: tool({
        description: "Read a file from the current project directory",
        inputSchema: toolInputSchemas.readFile,
    }),
    listDirectory: tool({
        description: "List files in a directory from the current project directory",
        inputSchema: toolInputSchemas.listDirectory,
    }),
    glob: tool({
        description: "Find files matching a glob pattern under the current project directory.",
        inputSchema: toolInputSchemas.glob,     
    }),
    grep: tool({
        description: "Find files matching a regex pattern under the current project directory.",
        inputSchema: toolInputSchemas.grep,     
    }), 


} as const;

export const buildToolContracts = {
    ...readOnlyToolContracts,
    writeFile: tool({
        description: "Write a file to the current project directory",
        inputSchema: toolInputSchemas.writeFile,    
    }),
    editFile: tool({
        description: "Edit a file in the current project directory",
        inputSchema: toolInputSchemas.editFile,
    }),
    bash: tool({
        description: "Execute a bash command in the current project directory",
        inputSchema: toolInputSchemas.bash,
    })  

} as const;

export type ToolContracts = typeof buildToolContracts;

export const getToolContracts = (mode:ModeType)=>{
    return mode === Mode.PLAN ? readOnlyToolContracts : buildToolContracts;
}
