import config from "@/config";
import { generateRefreshToken, signInUser } from "@/lib/auth";
import * as jose from "jose";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { WebResultType, WebResult } from "@/lib/constants";

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();
        const result: WebResultType = await signInUser(username, password);
        if (result === WebResult.auth.SUCCESS) {
            const refreshToken: string = await generateRefreshToken(username);

            let res: NextResponse = new NextResponse(JSON.stringify({ message:  result.message }), { status: result.code });
            return res;
        }
        return NextResponse.json(result.message, { status: result.code });
    } catch(error) {
        console.log(error);
        return NextResponse.json(WebResult.auth.UNKNOWN_ERROR.message, { status: WebResult.auth.UNKNOWN_ERROR.code });
    }
}