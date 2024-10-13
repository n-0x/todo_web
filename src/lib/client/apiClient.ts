import axios, { InternalAxiosRequestConfig } from "axios";
import { renewAccesToken } from "./auth";
import { parseJWT } from "../cross/auth";

axios.interceptors.request.use(async (conf: InternalAxiosRequestConfig) => {
    conf.withCredentials = true;
    await renewTokenOnExpiry();

    return conf;
});

export function extractAuthCookie(): string | undefined {
    return /(?:auth-token=([^;]+))/g.exec(document.cookie)?.[0];
}

export async function renewTokenOnExpiry() {
    let accesTokenRaw: string | undefined = extractAuthCookie();
    debugger;
    if (!accesTokenRaw) {
        await renewAccesToken();
        return;
    }

    let expiry: Date = new Date(1e3 * parseJWT(accesTokenRaw).exp);
    if (expiry.getTime() <= new Date().getTime()) {
        await renewAccesToken();
    }
}