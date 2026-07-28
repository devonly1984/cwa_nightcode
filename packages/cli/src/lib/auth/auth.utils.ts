import {existsSync,mkdirSync,readFileSync,writeFileSync,unlinkSync} from 'node:fs'
import type { AuthData } from './auth.types'
import { AUTH_DIR, AUTH_FILE } from './auth.constants'

export const getAuth =():AuthData|null=>{
    try {
    const data = readFileSync(AUTH_FILE,'utf-8');
    const parsed = JSON.parse(data) as Partial<AuthData>;
    return typeof parsed.token==='string'?{token:parsed.token}:null;    
    } catch (error) {
        return null;
        
    }
    
}

export const saveAuth = (data:AuthData)=>{
    if (!existsSync(AUTH_DIR)) {
        //Owner-only permission
        mkdirSync(AUTH_DIR, { mode: 0o700 })
    }
    writeFileSync(AUTH_FILE, JSON.stringify(data), { mode: 0o600 })


}
export const clearAuth = ()=>{
    try {
        unlinkSync(AUTH_FILE)
    } catch (error) {
        //file not exist
    }
}