import { AuthResult, AuthResultType, signInUser } from "@/utils/auth";
import * as jwt from "jsonwebtoken";

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();
        const result: AuthResultType = await signInUser(username, password);

        let headers;
        if (result === AuthResult.SUCCESS) {
            let jwtToken: string = jwt.sign({
                user_id: username
            },
            process.env.SECRET as string,
            {
                expiresIn: '1h'
            })
            headers = {
                'Authorization': `Bearer ${jwtToken}`
            }
        }
        
        return Response.json(result, { status: result.code, headers: headers });
    } catch(error) {
        const data = await req.json();
        console.log(error);
        return Response.json({ message: 'Failed to login!', code: 500});
    }
}