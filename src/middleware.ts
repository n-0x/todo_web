import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";
import { NextURL } from "next/dist/server/web/next-url";

export function middleware(request: NextRequest) {
    const dest: NextURL = request.nextUrl.clone();
    if (request.cookies.has('auth-token')) {
        if (jwt.verify(request.cookies.get('auth-token')?.value as string, process.env.SECRET as string)) {
            dest.pathname = '/';
            return NextResponse.redirect(dest);
        }
    }

    dest.pathname = '/login';
    return NextResponse.redirect(dest);
}

export const config = {
    matcher: '/((?!login|signup).*)',
}