import { createUser } from "@/utils/auth";

export async function POST(req: Request): Promise<Response> {
    try {
        const { email, password} = await req.json();
        createUser(email, password);

        return Response.json({ message: 'Signed up successful!', code: 200 })
    } catch(error) {
        console.log('Failed to signup!');
        return Response.json({ message: 'Failed to signup', code: 500 });
    }
}