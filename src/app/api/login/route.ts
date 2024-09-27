import { signInUser } from "@/utils/auth";
import { User, UserCredential } from "firebase/auth";
import { cookies } from "next/headers";

export default async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const user: User = (await signInUser(email, password)).user;
        return Response.json({ message: 'Welcome!', code: 200});
    } catch(error) {
        return Response.json({ message: 'Failed to sign in!', code: 500});
    }
}