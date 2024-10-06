import config from "@/config";
import { AuthResult, AuthResultType, signInUser } from "@/utils/auth";
import * as jose from "jose";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import * as constants from "@/utils/constants";

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();
        const result: AuthResultType = await signInUser(username, password);
        if (result === AuthResult.SUCCESS) {
            const token = await new jose.SignJWT()
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(`${config.auth.expiry}secs`)
            .setJti(nanoid())
            .sign(new TextEncoder().encode(constants.secrets.jwt));

            let res: NextResponse = new NextResponse(JSON.stringify({ message:  result.message }), { status: result.code });
            res.cookies.set('auth-token', token, {
                maxAge: config.auth.expiry
            })

            return res;
        }
        return NextResponse.json(result.message, { status: result.code });
    } catch(error) {
        console.log(error);
        return NextResponse.json(AuthResult.UNKNOWN_ERROR.message, { status: AuthResult.UNKNOWN_ERROR.code });
    }
}