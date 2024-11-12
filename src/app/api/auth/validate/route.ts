import { ASP } from "@/lib/server/auth";
import { AuthToken, secrets, Status } from "@/lib/server/constants";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
    if (['localhost', '127.0.0.1'].includes(req.nextUrl.host.split(':')[0])) {
        if (req.headers.has('Authorization')) {
            if (req.headers.get('Authorization') === `Bearer ${secrets.s2s_secret}`) {
                try {
                    const body = await req.json();
                    let tokenType: AuthToken;
                    if ('web_token' in body) {
                        tokenType = 'web_token';
                    } else if (req.cookies.has('api_token')) {
                        tokenType = 'api_token';
                    } else {
                        return NextResponse.json({}, { status: Status.BAD_REQUEST });
                    }

                    if (!body[tokenType]) {
                        return NextResponse.json({}, { status: Status.BAD_REQUEST });
                    }

                    return NextResponse.json({ valid: await ASP.validateXToken(tokenType, body[tokenType]) }, { status: Status.OK });
                } catch(error) {
                    if (!(error instanceof SyntaxError) || error.message !== 'Unexpected end of JSON input') {
                        console.error('Unexpected error during token validation:', error);
                        return NextResponse.json({}, { status: Status.INTERNAL_SERVER_ERROR });
                    }

                    return NextResponse.json({}, { status: Status.BAD_REQUEST });
                }
            }
        }
    }
    return NextResponse.json({}, { status: Status.FORBIDDEN });
}