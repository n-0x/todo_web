import { createUser } from "@/lib/server/auth";
import { Status } from "@/lib/server/constants";

export async function POST(req: Request): Promise<Response> {
    try {
        const { username, email, password} = await req.json();
        const result: WebResultType = await createUser(username, email, password);
        return Response.json(result, { status: result.code})
    } catch(error) {
        console.error('Failed to signup:', error);
        return Response.json({ message: 'Server error' },  { status: 500 });
    }
}