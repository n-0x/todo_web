import { NextRequest, NextResponse } from "next/server";
import { NextURL } from "next/dist/server/web/next-url";
import { AuthToken, secrets, Status } from "@/lib/server/constants";

export const config = {
    runtime: "nodejs"
}

async function validateToken(tokenType: AuthToken, token: string): Promise<boolean> {
    return await (fetch(`${process.env.NODE_ENV === "development" ? 'http://' : 'https://'}localhost:${process.env.PORT || 3000}/api/auth/validate`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${secrets.s2s_secret}`
        },
        body: JSON.stringify({
            [tokenType]: token
        })
    }).then(async (res: Response) => {
        if (res.ok) {
            return (await res.json()).valid;
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
    if (dest.pathname.startsWith('/api/')) {
        if (req.cookies.has('api_token') && req.cookies.get('api_token')) {
            const res = await validateToken('api_token', req.cookies.get('api_token')?.value as string);

            if (res) {
                return NextResponse.next();
            }
        }

        return NextResponse.json({}, { status: Status.INTERNAL_SERVER_ERROR });
    }

    if (req.cookies.has('web_token') && req.cookies.get('web_token')) {
        const res = await validateToken('web_token', req.cookies.get('web_token')?.value as string);
        
        if (res) {
            return NextResponse.next();
        }


        dest.pathname = '/login';
        return NextResponse.redirect(dest, { status: Status.FOUND });
    }

    dest.pathname = '/login'
    return NextResponse.redirect(dest);
}