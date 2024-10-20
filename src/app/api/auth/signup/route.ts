import { createUser } from "@/lib/server/auth";
import { Status, IStatusWithMeta } from "@/lib/server/constants";

export async function POST(req: Request): Promise<Response> {
    try {
        const { username, email, password} = await req.json();
        const result: IStatusWithMeta = await createUser(username, email, password);
        return Response.json(result.type ? result.type : {}, { status: result.code})
    } catch(error) {
        console.error('Failed to signup:', error);
        return Response.json({ message: 'Server error' },  { status: 500 });
    }
}