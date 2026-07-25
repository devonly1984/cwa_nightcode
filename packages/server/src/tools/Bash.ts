import { tool } from 'ai';
import z from 'zod';
import { DEFAULT_TIMEOUT, MAX_OUTPUT } from '../constants';

export const createBashTool = (cwd: string) => {
    return tool({
        description: 
        "Execute a shell command in the project directory., Use this for running tess, builds,git operations,package installs, and any other shell commands",
        inputSchema: z.object({
            command: z.string().describe("The shell command to execute"),
            timeout: z.number().describe("Timeout in milliseconds (default:30000)").default(DEFAULT_TIMEOUT)
        }),
        execute: async({command,timeout})=>{
            try {
                const proc = Bun.spawn(['bash','-c',command],{
                    cwd,
                    stdout: 'pipe',
                    stderr: "pipe",
                    env: {...process.env, TERM: "dumb"}
                })
                const timer = setTimeout(()=>{
                    proc.kill()
                },timeout)
                const [stdout,stderr] = await Promise.all([
                    new Response(proc.stdout).text(),
                    new Response(proc.stderr).text()
                ])
                const exitCode = await proc.exited;
                clearTimeout(timer)
                const truncate = (s:string)=>s.length>MAX_OUTPUT ? s.slice(0,MAX_OUTPUT)+ `\n... (truncated, ${s.length} total chars)`:s
                return {
                    stdout: truncate(stdout),
                    stderr: truncate(stderr),
                    exitCode
                }
            } catch (error) {
                const message = error instanceof Error ? error.message:String(error);
                return { error: `Failed to execute command: ${message}` }
                
            }
        }
    })

}