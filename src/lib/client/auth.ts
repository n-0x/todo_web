import { parseJWT } from "../cross/auth";
import { extractAuthCookie, renewTokenOnExpiry } from "./apiClient";

export function withAuth(): () => void {

    const beforeUnload = (e: Event) => {
        console.log('[TEST BEFORE UNLOAD]');
        renewTokenOnExpiry().then();
    }

    window.addEventListener('beforeunload', beforeUnload);

    return () => {
        window.removeEventListener('beforeunload', beforeUnload);
    }
}

export type WebResultType = { message: string, code: number };
export async function renewAccesToken(): Promise<WebResultType> {
    debugger
    return await fetch('api/auth/token', { method: 'POST', keepalive: true,  }).then(async (res) => {console.log(res.url); return await res.json() as WebResultType; });
}