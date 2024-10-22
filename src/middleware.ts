import { NextRequest, NextResponse } from "next/server";
import { NextURL } from "next/dist/server/web/next-url";
import { JWTExpired } from "jose/errors";
import { secrets, Status } from "@/lib/server/constants";
import { jwtVerify } from "jose";
import config from "./config";
import { parseJWT } from "./lib/cross/auth";
import { authStateProvider } from "./lib/server/auth";

export async function middleware(req: NextRequest): Promise<NextResponse> {
    const allowed = /^\/(?:(?:login|signup)|(?:_next\/.*)|(?:api\/auth\/(?:login|signup)))\/?$/;

    if (allowed.test(req.nextUrl.pathname)) {
        return NextResponse.next();
    }

    const dest: NextURL = req.nextUrl.clone();
    if (dest.pathname === '/api/auth/token') {
        if (req.cookies.has('refresh-token')) {

            if (await authStateProvider.isAccesJWTValid(req.cookies.get('refresh-token')?.value as string)) {
                return NextResponse.next();
            }
        }
        return NextResponse.json({}, { status: Status.UNAUTHORIZED });
    }

    if (req.cookies.has('auth-token')) {
        let token: string = req.cookies.get('auth-token')?.value as string;
        if (await authStateProvider.isAccesJWTValid(token)) {
            return NextResponse.next();
        } else {
            return NextResponse.json({}, { status: Status.UNAUTHORIZED });
        }
    }

    dest.pathname = '/login'
    return NextResponse.redirect(dest);
}