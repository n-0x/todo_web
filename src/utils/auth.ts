import { genSalt, hash } from "bcryptjs";
import { user } from "./db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import config from "@/config";

export type AuthResultType = { message: string, code: number };
export const AuthResult: Record<string, AuthResultType> = {
    SUCCESS: { message: 'Welcome!', code: 200},
    EMAIL_EXISTS: { message: 'This email is already in use!', code: 409 },
    USERNAME_EXISTS: { message: 'This username is not available!', code: 409 },
    UNKNOWN_ERROR: { message: 'Unknown error, report to admin immediately!', code: 500}
}



export async function createUser(username: string, email: string, password: string): Promise<AuthResultType>{
    const pass_salt: string = await genSalt(config.auth.salt_rounds as number);
    const pass_hash = await hash(password, pass_salt);
    let result = await user.create({
        data: {
            username: username,
            email: email,
            pass_hash: pass_hash,
            pass_salt: pass_salt,
        },
    }).then( () => AuthResult.SUCCESS
    ).catch((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
            switch(err.code) {
                case 'P2002': {
                    if (err.meta !== undefined) {
                        if (Array.isArray(err.meta.target)) {
                            if (err.meta.target.includes('email')) {
                                return AuthResult.EMAIL_EXISTS;
                            } else if(err.meta.target.includes('username')) {
                                return AuthResult.USERNAME_EXISTS;
                            }
                        }
                    }
                    break;
                }
            }
        }
        console.log('Unknown error:', err);
        return AuthResult.UNKNOWN_ERROR;
    })
    console.log(username, result);
    return new Promise<AuthResultType>((resolve) => resolve(result));
}

export function signInUser(username: string, password: string) {
    
}