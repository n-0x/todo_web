import { NextRequest, NextResponse } from "next/server";
import { NextURL } from "next/dist/server/web/next-url";
import { jwtVerify } from "jose";
import * as constants from "@/lib/constants";

export async function middleware(req: NextRequest) {
    const allowed = /^\/(?:(?:login|signup)|(?:_next\/.*)|(?:api\/auth\/(?:login|signup)))\/?$/;
    
    if (allowed.test(req.nextUrl.pathname)) {
        return NextResponse.next();
    }

    const dest: NextURL = req.nextUrl.clone();
    if (req.cookies.has('auth-token')) {
        try {
            const verified = await jwtVerify(req.cookies.get('auth-token')?.value as string, new TextEncoder().encode(constants.secrets.acces_jwt));
            return NextResponse.next(); 
        } catch(error) {
            console.error('Verification failed:', error);
        }
    }

    dest.pathname = '/login'
    return NextResponse.redirect(dest);
}