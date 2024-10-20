import * as bcrypt from "bcryptjs";
import { prisma } from "./db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import config from "@/config";
import { nanoid } from "nanoid";
import { Status, IStatusWithMeta, secrets } from "./constants";
import * as jose from 'jose';
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";


async function generateToken(user: string, secret: string, expiry: string): Promise<{ id: string, token: string }> {
    let id: string = nanoid();
    return {
        token: await new jose.SignJWT()
        .setProtectedHeader({ alg: config.auth.jwt.alg })
        .setJti(id)
        .setExpirationTime(expiry)
        .setIssuer(config.auth.jwt.issuer)
        .setIssuedAt(new Date())
        .setSubject(user)
        .sign(new TextEncoder().encode(secret)),
        id: id
    }
}

export async function generateRefreshToken(user: string): Promise<string> {
    const { token, id } = await generateToken(user, secrets.refresh_jwt, `${config.auth.refresh_expiry}days`);

    const expiry: Date = new Date();
    expiry.setDate(config.auth.refresh_expiry);

    await prisma.blacklisted_tokens.create({
        data: {
            owner_name: user,
            jti: id,
            expires: expiry,
        }
    })

    return token;
}

export async function verifyRefreshToken(token: string, username: string): Promise<number> {
    const payload = (await jose.jwtVerify(token, new TextEncoder().encode(secrets.refresh_jwt))).payload;
    const dbRes = await prisma.blacklisted_tokens.count({
        where: {
            owner_name: username,
            jti: payload.jti,
        },
    })

    return dbRes == 0 ? Status.OK : Status.FORBIDDEN;
}

export async function setFreshTokens(user: string, res: NextResponse): Promise<void> {
    let expiryRefresh: Date = new Date();
    expiryRefresh.setDate(expiryRefresh.getDate() + config.auth.refresh_expiry);

    let expiryAccess: Date = new Date();
    expiryAccess.setSeconds(expiryAccess.getSeconds() + config.auth.access_expiry);

    res.cookies.set('refresh-token', await generateRefreshToken(user), { path: '/api/auth/token', expires: expiryRefresh, sameSite: "strict", httpOnly: true, secure: config.general.enforceHTTPS });
    res.cookies.set('auth-token', await generateAccessToken(user), { path: '/', expires: expiryAccess, httpOnly: false, secure: config.general.enforceHTTPS });
}

export async function generateAccessToken(userID: string): Promise<string> {
    return (await generateToken(userID, secrets.acces_jwt, `${config.auth.access_expiry}secs`)).token;
}

export async function createUser(username: string, email: string, password: string): Promise<IStatusWithMeta> {
    if (!username || !password) {
        return { type: 'unkown_error', code: Status.INTERNAL_SERVER_ERROR };
    }

    const pass_salt: string = await bcrypt.genSalt(config.auth.salt_rounds as number);
    const pass_hash = await bcrypt.hash(password, pass_salt);
    let result: IStatusWithMeta = await prisma.user.create({
        data: {
            username: username,
            email: email,
            pass_hash: pass_hash,
        }
    }).then(() => { return { code: Status.OK }; }
    ).catch((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
            switch (err.code) {
                case 'P2002': {
                    if (err.meta !== undefined) {
                        if (Array.isArray(err.meta.target)) {
                            if (err.meta.target.includes('email')) {
                                return { type: 'email', code: Status.CONFLICT };
                            } else if (err.meta.target.includes('username')) {
                                return { type: 'username', code: Status.CONFLICT };
                            }
                        }
                    }
                    break;
                }
            }
        }
        console.log('Unknown error:', err);
        return { code: Status.INTERNAL_SERVER_ERROR };
    })
    return result;
}

export async function signInUser(username: string, password: string): Promise<number> {
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
            return Status.UNAUTHORIZED;
        }

        if (await bcrypt.compare(password, result.pass_hash)) {
            return Status.OK;
        }

        return Status.UNAUTHORIZED;
    } catch (err) {
        console.error('Unknown error:', err);
        return Status.INTERNAL_SERVER_ERROR;
    }
}

interface IAuthState {
    api?: {
        expires: Date | undefined,
        token: string
    },
    web?: {
        expires: Date | undefined,
        token: string
    }
}

class AuthStateProvider {
    private authState = new Map<string, IAuthState>(); // username, auth-state

    generateWebToken(user: string) {

        let token:string = randomBytes(64).toString('base64');
        let expires: Date = new Date();
        expires.setDate(expires.getDate() + config.auth.web_expiry);

        if (this.authState.has(user)) {
            (this.authState.get(user) as IAuthState).web = { expires: expires, token: token };
        } else {
            this.authState.set(user, { web: { expires: expires, token: token }})
        }

        prisma.web_tokens.delete({ where: { username: user } })
        prisma.web_tokens.create({
            data: {
                username: user,
                token: token,
                expires: expires,
            }
        })
    }
}