import { genSalt, hash } from "bcryptjs";
import { user } from "./db";


export async function createUser(username: string, email: string, password: string): Promise<void> {
    const pass_salt: string = await genSalt(Number.parseInt(process.env.SALT_ROUNDS as string));
    const pass_hash = await hash(password, pass_salt);
    await user.create({
        data: {
            username: username,
            email: email,
            pass_hash: pass_hash,
            pass_salt: pass_salt,
        },
    })
}

export function signInUser(email: string, password: string) {

}