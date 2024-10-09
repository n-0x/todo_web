import config from "@/config";
import { generateAccessToken, generateRefreshToken, signInUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { WebResultType, WebResult } from "@/lib/constants";

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();
        const result: WebResultType = await signInUser(username, password);
        if (result === WebResult.auth.SUCCESS) {
            const refreshToken: string = await generateRefreshToken(username);
            let expiryRefresh: Date = new Date();
            expiryRefresh.setDate(expiryRefresh.getDate() + config.auth.refresh_expiry);

            let expiryAccess: Date = new Date();
            expiryAccess.setSeconds(expiryAccess.getSeconds() + config.auth.access_expiry);

            let res: NextResponse = new NextResponse(JSON.stringify({ message:  result.message }), { status: result.code });
            res.cookies.set('refresh-token', refreshToken, { path: '/api/auth/token', expires: expiryRefresh, httpOnly: true, secure: config.general.enforceHTTPS });
            res.cookies.set('auth-token', await generateAccessToken(username), { path: '/', expires: expiryAccess, httpOnly: true, secure: config.general.enforceHTTPS });
            return res;
        }
        return NextResponse.json(result.message, { status: result.code });
    } catch(error) {
        console.log(error);
        return NextResponse.json(WebResult.auth.UNKNOWN_ERROR.message, { status: WebResult.auth.UNKNOWN_ERROR.code });
    }
}