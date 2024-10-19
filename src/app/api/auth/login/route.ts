import config from "@/config";
import { generateAccessToken, generateRefreshToken, setFreshTokens, signInUser } from "@/lib/server/auth";
import { Status } from "@/lib/server/constants";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();
        const result: number = await signInUser(username, password);
        if (result === Status.OK) {
            const refreshToken: string = await generateRefreshToken(username);

            let res: NextResponse = new NextResponse('', { status: result });
            await setFreshTokens(username, res);
            return res;
        }
        return NextResponse.json({}, { status: result });
    } catch(error) {
        console.log(error);
        return NextResponse.json({}, { status: Status.INTERNAL_SERVER_ERROR });
    }
}