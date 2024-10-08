import * as bcrypt from "bcryptjs";
import { prisma } from "./db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import config from "@/config";
import * as jose from "jose";
import { nanoid } from "nanoid";
import { WebResult, WebResultType, secrets } from "./constants";
import { jwtDecrypt } from "jose";


async function generateToken(userID: string, secret: string, expiry: string | number): Promise<string> {
    return await new jose.SignJWT({ userID: userID })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiry)
        .setJti(nanoid())
        .sign(new TextEncoder().encode(secret))
}

export async function generateRefreshToken(userID: string): Promise<string> {
    return await generateToken(userID, secrets.refresh_jwt, config.auth.refresh_expiry);
}

export async function verifyRefreshToken(token: string) {
    const verified = await jwtDecrypt(token, new TextEncoder().encode(secrets.refresh_jwt));
}

export async function generateAccessToken(userID: string): Promise<string> {
    return await generateToken(userID, secrets.acces_jwt, config.auth.access_expiry);
}

export async function createUser(username: string, email: string, password: string): Promise<WebResultType> {
    if (!username || !password) {
        return new Promise((resolve) => resolve(WebResult.auth.UNKNOWN_ERROR));
    }

    const pass_salt: string = await bcrypt.genSalt(config.auth.salt_rounds as number);
    const pass_hash = await bcrypt.hash(password, pass_salt);
    let result: WebResultType = await prisma.user.create({
        data: {
            username: username,
            email: email,
            pass_hash: pass_hash,
        }
    }).then(() => WebResult.auth.SUCCESS
    ).catch((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
            switch (err.code) {
                case 'P2002': {
                    if (err.meta !== undefined) {
                        if (Array.isArray(err.meta.target)) {
                            if (err.meta.target.includes('email')) {
                                return WebResult.auth.EMAIL_EXISTS;
                            } else if (err.meta.target.includes('username')) {
                                return WebResult.auth.USERNAME_EXISTS;
                            }
                        }
                    }
                    break;
                }
            }
        }
        console.log('Unknown error:', err);
        return WebResult.auth.UNKNOWN_ERROR;
    })
    console.log(username, result);
    return new Promise<WebResultType>((resolve) => resolve(result));
}

export async function signInUser(username: string, password: string): Promise<WebResultType> {
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
            return WebResult.auth.WRONG_CREDENTIALS;
        }

        if (await bcrypt.compare(password, result.pass_hash)) {
            return WebResult.auth.SUCCESS;
        }

        return WebResult.auth.WRONG_CREDENTIALS;
    } catch (err) {
        console.error('Unknown error:', err);
        return WebResult.auth.UNKNOWN_ERROR;
    }
}