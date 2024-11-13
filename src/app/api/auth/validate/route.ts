import { ASP, IAuthState } from "@/lib/server/auth";
import { AuthToken, AuthTokenStatus, secrets, Status } from "@/lib/server/constants";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
    if (['localhost', '127.0.0.1'].includes(req.nextUrl.host.split(':')[0])) {
        if (req.headers.has('Authorization')) {
            if (req.headers.get('Authorization') === `Bearer ${secrets.s2s_secret}`) {
                try {
                    const body = await req.json();
                    let tokenType: AuthToken;
                    if ('web' in body) {
                        tokenType = 'web';
                    } else if ('api' in body) {
                        tokenType = 'api';
                    } else {
                        return NextResponse.json({}, { status: Status.BAD_REQUEST });
                    }

                    const token = body[tokenType];

                    if (!token) {
                        return NextResponse.json({}, { status: Status.BAD_REQUEST });
                    }

                    const res = await ASP.validateXToken(tokenType, token);
                    if (res == AuthTokenStatus.SOUR) {
                        const newState = await ASP.renewXToken(tokenType, token);
                        if (!newState) {
                            console.log(`${body.sender} tried to renew a token without a valid old one!`)
                            return NextResponse.json({ valid: AuthTokenStatus.INVALID });
                        }
                        return NextResponse.json({ valid: res, type: tokenType, token: newState[tokenType].token, expires: newState.expires }, { status: Status.OK });
                    }
                    return NextResponse.json({ valid: res }, { status: Status.OK });
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