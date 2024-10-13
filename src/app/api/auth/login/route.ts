import config from "@/config";
import { generateAccessToken, generateRefreshToken, setFreshTokens, signInUser } from "@/lib/server/auth";
import { NextRequest, NextResponse } from "next/server";
import { WebResultType, WebResult } from "@/lib/server/constants";

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();
        const result: WebResultType = await signInUser(username, password);
        if (result === WebResult.auth.SUCCESS) {
            const refreshToken: string = await generateRefreshToken(username);

            let res: NextResponse = new NextResponse(JSON.stringify({ message:  result.message }), { status: result.code });
            await setFreshTokens(username, res);
            return res;
        }
        return NextResponse.json(result.message, { status: result.code });
    } catch(error) {
        console.log(error);
        return NextResponse.json(WebResult.auth.UNKNOWN_ERROR.message, { status: WebResult.auth.UNKNOWN_ERROR.code });
    }
}