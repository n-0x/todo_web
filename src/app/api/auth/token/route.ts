import config from "@/config";
import { parseJWT } from "@/lib/cross/auth";
import { generateAccessToken, setFreshTokens } from "@/lib/server/auth";
import { secrets, Status } from "@/lib/server/constants";
import { jwtVerify } from "jose";
import { JWTExpired } from "jose/errors";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    if (req.cookies.has('refresh-token')) {
        let token: string = req.cookies.get('refresh-token')?.value as string;
        try {
            jwtVerify(token, new TextEncoder().encode(secrets.refresh_jwt));
            let payload = parseJWT(token);
            let res: NextResponse = NextResponse.json({});
            await setFreshTokens(payload.sub, res);
            return res;
        } catch(error) {
            if (!(error instanceof JWTExpired)) {
                console.error(error);
            }

            return NextResponse.json({}, { status: Status.FORBIDDEN })
        }
        
    } else {
        return NextResponse.json({}, { status: Status.BAD_REQUEST })
    }
}