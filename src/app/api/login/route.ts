import config from "@/config";
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
                expiresIn: config.auth.expiry
            })
            headers = {
                'Set-Cookie': `auth-token=${jwtToken}; path=/; Secure; Max-Age=${config.auth.expiry}`
            }
        }
        
        return Response.json(result, { status: result.code, headers: headers });
    } catch(error) {
        console.log(error);
        return Response.json({ message: 'Failed to login!', code: 500});
    }
}