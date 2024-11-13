import { NextRequest, NextResponse } from "next/server";
import { NextURL } from "next/dist/server/web/next-url";
import { AuthToken, AuthTokenStatus, secrets, Status } from "@/lib/server/constants";

/**
 * Validate a token on the server-side
 * @param tokenType either `web` or `api`
 * @param senderIP  the ip which tries to acces a route with the `token`
 * @param token     the token to validate
 * @returns         the `json`-value of the response-body
 */
async function validateToken(tokenType: AuthToken, senderIP: string, token: string): Promise<any> {
    return await (fetch(`${process.env.NODE_ENV === "development" ? 'http://' : 'https://'}localhost:${process.env.PORT || 3000}/api/auth/validate`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${secrets.s2s_secret}`
        },
        body: JSON.stringify({
            [tokenType]: token,
            sender: senderIP,
        })
    }).then(async (res: Response) => {
        if (res.ok) {
            return await res.json();
        }
        throw new Error(`S2S-responds not okay: ${res.status}`);
    }).catch((error) => {
        console.log('Failed to fetch s2s-api:', error);
        return false;
    }))
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
    const allowed = /^\/(?:(?:login|signup)|(?:_next\/.*)|(?:api\/auth\/(?:login|signup|validate)))\/?$/;

    if (allowed.test(req.nextUrl.pathname)) {
        return NextResponse.next();
    }

    const dest: NextURL = req.nextUrl.clone();
    let type: AuthToken = 'web';
    if (dest.pathname.startsWith('/api/')) {
        // if (req.cookies.has('api_token') && req.cookies.get('api_token')) {
        //     const res = await validateToken('api', req.cookies.get('api_token')?.value as string);

        //     if (res === AuthTokenStatus.VALID) {
        //         return NextResponse.next();
        //     }
        // }

        // return NextResponse.json({}, { status: Status.INTERNAL_SERVER_ERROR });

        type = 'api'
    }

    const tokenName = type + '_token';
    if (req.cookies.has(tokenName) && req.cookies.get(tokenName)) {
        const s2sResponds = await validateToken(type, req.ip || '-1.-1.-1.-1', req.cookies.get(tokenName)?.value as string);
        
        const status = s2sResponds.valid;
        if (status === AuthTokenStatus.VALID) {
            return NextResponse.next();
        } else if (status === AuthTokenStatus.SOUR) {
            const res = NextResponse.next();
            res.cookies.set(tokenName + '_token', s2sResponds.token, { path: type === 'api' ? '/api/' : '/', httpOnly: true, expires: s2sResponds.expires, sameSite: "lax", secure: process.env.NODE_ENV !== "development" })
            return res;
        }


        dest.pathname = '/login';
        return NextResponse.redirect(dest, { status: Status.FOUND });
    }

    dest.pathname = '/login'
    return NextResponse.redirect(dest);
}