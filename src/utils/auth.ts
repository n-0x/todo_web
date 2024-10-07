import * as bcrypt from "bcryptjs";
import { prisma } from "./db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import config from "@/config";
import * as jwt from "jsonwebtoken";

export type AuthResultType = { message: string, code: number };
export const AuthResult: Record<
    'SUCCESS' | 'EMAIL_EXISTS' | 'USERNAME_EXISTS' | 'UNKNOWN_ERROR' | 'WRONG_CREDENTIALS'
, AuthResultType> = {
    SUCCESS: { message: 'Welcome!', code: 200},
    EMAIL_EXISTS: { message: 'This email is already in use!', code: 409 },
    USERNAME_EXISTS: { message: 'This username is not available!', code: 409 },
    UNKNOWN_ERROR: { message: 'Unknown error, report to admin immediately!', code: 500 },
    WRONG_CREDENTIALS: { message: 'Either your username or your password is wrong!', code: 401 }
}



export async function createUser(username: string, email: string, password: string): Promise<AuthResultType> {
    if (!username || !password) {
        return new Promise((resolve) => resolve(AuthResult.UNKNOWN_ERROR));
    }

    const pass_salt: string = await bcrypt.genSalt(config.auth.salt_rounds as number);
    const pass_hash = await bcrypt.hash(password, pass_salt);
    let result: AuthResultType = await prisma.user.create({
        data: {
            username: username,
            email: email,
            pass_hash: pass_hash,
        }
    }).then(() => AuthResult.SUCCESS
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

export async function signInUser(username: string, password: string): Promise<AuthResultType> {
    try {
        let result: 
            { username: string; pass_hash: string; } | null
        = await prisma.user.findUnique({
            select: {
                username: true,
                pass_hash: true,
            },
            where: {
                username: username
            },
        });

        if (result === null) {
            return AuthResult.WRONG_CREDENTIALS;
        }

        if (await bcrypt.compare(password, result.pass_hash)) {
            return AuthResult.SUCCESS;
        }

        return AuthResult.WRONG_CREDENTIALS;
    } catch(err) {
        console.error('Unknown error:', err);
        return AuthResult.UNKNOWN_ERROR;
    }
}