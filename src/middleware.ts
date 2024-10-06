import { NextRequest, NextResponse } from "next/server";
import { NextURL } from "next/dist/server/web/next-url";
import { jwtVerify } from "jose";
import * as constants from "@/utils/constants";

export async function middleware(req: NextRequest) {
    const dest: NextURL = req.nextUrl.clone();
    if (req.cookies.has('auth-token')) {
        try {
            const verified = await jwtVerify(req.cookies.get('auth-token')?.value as string, new TextEncoder().encode(constants.secrets.jwt));
            return NextResponse.next(); 
        } catch(error) {
            console.error(error);
        }
    }

    dest.pathname = '/login'
    return NextResponse.redirect(dest);
}

 export const config = {
    matcher: '/((?!login|signup|api|_next).*)',
}