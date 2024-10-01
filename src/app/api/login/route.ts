import { signInUser } from "@/utils/auth";

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();
        signInUser(username, password);
        
        
        return Response.json({ message: 'Welcome!', code: 200});
    } catch(error) {
        const data = await req.json();
        console.log(error);
        return Response.json({ message: 'Failed to login!', code: 500});
    }
}