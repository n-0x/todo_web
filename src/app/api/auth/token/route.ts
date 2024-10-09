import { secrets, WebResult } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

export default async function POST(req:NextRequest) {
    const data = await req.json();

    if ('refresh-token' in data) {
        
    } else {
        return NextResponse.json(WebResult.general.INVALID_REQUEST.message, { status: WebResult.general.INVALID_REQUEST.code })
    }
}