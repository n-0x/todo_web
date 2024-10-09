import { NextRequest, NextResponse } from "next/server";
import { NextURL } from "next/dist/server/web/next-url";
import * as constants from "@/lib/constants";
import * as jose from 'jose';
import { JWTExpired } from "jose/errors";
import { WebResult } from "@/lib/constants";

export async function middleware(req: NextRequest) {
    const allowed = /^\/(?:(?:login|signup)|(?:_next\/.*)|(?:api\/auth\/(?:login|signup)))\/?$/;
    
    if (allowed.test(req.nextUrl.pathname)) {
        return NextResponse.next();
    }

    const dest: NextURL = req.nextUrl.clone();
    const cookies = req.cookies.get('auth-token');
    if (req.cookies.has('auth-token')) {
        try {
            await jose.jwtVerify(req.cookies.get('auth-token')?.value as string, new TextEncoder().encode(constants.secrets.acces_jwt));
            return NextResponse.next(); 
        } catch(error) {
            if (error instanceof JWTExpired) {
                error = 'Access-token expired!'
                return NextResponse.json(WebResult.auth.ACCES_EXPIRED.message, { status: WebResult.auth.ACCES_EXPIRED.code })
            }
            console.log('Verification failed:', error);
        }
    }

    dest.pathname = '/login'
    return NextResponse.redirect(dest);
}