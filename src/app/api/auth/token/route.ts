import config from "@/config";
import { parseJWT } from "@/lib/cross/auth";
import { authStateProvider } from "@/lib/server/auth";
import { secrets, Status } from "@/lib/server/constants";
import { jwtVerify } from "jose";
import { JWTExpired } from "jose/errors";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    if (req.cookies.has('refresh-token')) {
        let token: string = req.cookies.get('refresh-token')?.value as string;
        if (await authStateProvider.isAccesJWTValid(token)) {
            const res: NextResponse = NextResponse.json({}, { status: Status.OK });
            authStateProvider.setFreshTokensOnClient(req.cookies.get('refresh-token')?.value as string , res);

            return res;
        }
        
    }
    
    return NextResponse.json({}, { status: Status.UNAUTHORIZED });
}