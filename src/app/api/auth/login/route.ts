import { ASP, IAuthState, setTokensOnRes, signInUser } from "@/lib/server/auth";
import { Status } from "@/lib/server/constants";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();
        const result: number = await signInUser(username, password);
        if (result === Status.OK) {
            let res: NextResponse = new NextResponse('', { status: result });
            const state: IAuthState = await ASP.createAuthState(username);
            setTokensOnRes(state, res);
            return res;
        }
        return NextResponse.json({}, { status: result });
    } catch(error) {
        console.log(error);
        return NextResponse.json({}, { status: Status.INTERNAL_SERVER_ERROR });
    }
}