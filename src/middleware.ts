import { NextRequest, NextResponse } from "next/server";
import { NextURL } from "next/dist/server/web/next-url";
import * as constants from "@/lib/server/constants";
import { JWTExpired } from "jose/errors";
import { secrets, WebResult } from "@/lib/server/constants";
import { jwtVerify } from "jose";
import config from "./config";
import { parseJWT } from "./lib/cross/auth";

export async function middleware(req: NextRequest): Promise<NextResponse> {
    const allowed = /^\/(?:(?:login|signup)|(?:_next\/.*)|(?:api\/auth\/(?:login|signup)))\/?$/;
    
    if (allowed.test(req.nextUrl.pathname)) {
        return NextResponse.next();
    }

    const dest: NextURL = req.nextUrl.clone();
    if (dest.pathname === '/api/auth/token') {
        if (req.cookies.has('refresh-token')) {
            try {
                await jwtVerify(req.cookies.get('refresh-token')?.value as string, new TextEncoder().encode(secrets.refresh_jwt))
                return NextResponse.next();
            } catch(error) {}
        }
        return NextResponse.json({}, { status: 401 });
    }

    if (req.cookies.has('auth-token')) {
        let token: string = req.cookies.get('auth-token')?.value as string;
        try {
            await jwtVerify(token, new TextEncoder().encode(secrets.acces_jwt));
        } catch(error) {
            if (error instanceof JWTExpired) {
                let expiry = new Date(1e3 * parseJWT(token).exp);

                if (expiry < new Date(new Date().getTime() + config.auth.access_mercy)) {
                    let headers: HeadersInit = new Headers();
                    headers.set('x-access-token-expired', 'true');
                    return NextResponse.next(
                        {
                            headers: headers,
                            status: WebResult.auth.ACCESS_EXPIRED.code
                        }
                    )
                }
            }
            return NextResponse.json({}, { status: 401 })
        }
        return NextResponse.next();
    }

    dest.pathname = '/login'
    return NextResponse.redirect(dest);
}