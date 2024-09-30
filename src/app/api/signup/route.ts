import { AuthResultType, createUser } from "@/utils/auth";

export async function POST(req: Request): Promise<Response> {
    try {
        const { username, email, password} = await req.json();
        const result: AuthResultType = await createUser(username, email, password);
        return Response.json(result, { status: result.code})
    } catch(error) {
        console.error('Failed to signup:', error);
        return Response.json({ message: 'Server error' },  { status: 500 });
    }
}