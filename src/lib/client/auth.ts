import { parseJWT } from "../cross/auth";
import { extractAuthCookie, renewTokenOnExpiry } from "./apiClient";

export function withAuth(): () => void {

    const beforeUnload = (e: Event) => {
        console.log('[TEST BEFORE UNLOAD]');
        renewTokenOnExpiry();
    }

    window.addEventListener('beforeunload', beforeUnload);

    return () => {
        window.removeEventListener('beforeunload', beforeUnload);
    }
}

export type WebResultType = { message: string, code: number };
export function renewAccesToken(): boolean {
    debugger
    return navigator.sendBeacon('api/auth/token');
}