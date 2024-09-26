import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/utils/auth";
import  { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method == 'POST') {
        try {
            const { email, password} = await JSON.parse(req.body);
            createUser(email, password);
    
            return NextResponse.json({ message: 'Signed up successful!', code: 200 })
        } catch(error) {
            console.log('Failed to signup!');
            return NextResponse.json({ message: 'Failed to signup', code: 500 });
        }
    }
}