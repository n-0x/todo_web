import { createUser } from "@/lib/server/auth";
import { Status, IStatusWithMeta } from "@/lib/server/constants";
import { NextResponse } from "next/server";

export async function POST(req: Request): Promise<NextResponse> {
    try {
        const { username, email, password} = await req.json();
        const result: IStatusWithMeta = await createUser(username, email, password);
        return NextResponse.json(result.type ? {type: result.type } : {}, { status: result.code})
    } catch(error) {
        console.error('Failed to signup:', error);
        return NextResponse.json(Status.INTERNAL_SERVER_ERROR);
    }
}