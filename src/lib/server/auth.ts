import * as bcrypt from "bcryptjs";
import { prisma } from "./db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import config from "@/config";
import { nanoid } from "nanoid";
import { Status, IStatusWithMeta, secrets } from "./constants";
import * as jose from 'jose';
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { JWTExpired, JWTInvalid } from "jose/errors";

export async function setFreshTokens(user: string, res: NextResponse): Promise<void> {
    let expiryRefresh: Date = new Date();
    expiryRefresh.setDate(expiryRefresh.getDate() + config.auth.refresh_expiry);

    let expiryAccess: Date = new Date();
    expiryAccess.setSeconds(expiryAccess.getSeconds() + config.auth.access_expiry);

    res.cookies.set('refresh-token', await generateRefreshToken(user), { path: '/api/auth/token', expires: expiryRefresh, sameSite: "strict", httpOnly: true, secure: config.general.enforceHTTPS });
    res.cookies.set('auth-token', await generateAccessToken(user), { path: '/', expires: expiryAccess, httpOnly: false, secure: config.general.enforceHTTPS });
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
    api_token?: string,
    web_token?: string,
    expires: Date,
}

class AuthStateProvider {

    /**
     * Map containing all currently cached auth-states
     */
    private authStates = new Map<string, IAuthState>();

    /**
     * Generate a opeaque token a token for the user
     * @param user The user to generate the token for
     * @param type Either a `api_token` or `web_token`
     * @returns A reference to the auth-state after the generation
     */
    private generateToken(user: string, type: 'api_token' | 'web_token'): IAuthState {
        let expires: Date = new Date();
        expires.setDate(expires.getDate() + config.auth.long_token_epxiry);
        const token: string = randomBytes(64).toString('base64');
        let authState: IAuthState | undefined = undefined;

        if (this.authStates.has(user)) {
            authState = this.authStates.get(user) as IAuthState;
            authState[type] = token;
        } else {
            authState = { expires: expires };
            authState[type] = token;
            this.authStates.set(user, authState);
        }

        return authState;
    }

    /**
     * Generate both `web_token` and `api_token` for a user
     * @param user The user to generate the token for
     * @returns    True if successful, false otherwise
     */
    async generateAuthTokens(user: string): Promise<boolean> {
        this.generateToken(user, 'api_token');
        const authState: IAuthState = this.generateToken(user, 'web_token');

        try {
            await prisma.long_lived_tokens.upsert({
                create: {
                    username: user,
                    expires: authState.expires,
                    api_token: authState.api_token as string,
                    web_token: authState.web_token as string,
                },
                update: {
                    username: user,
                    expires: authState.expires,
                    api_token: authState.api_token as string,
                    web_token: authState.web_token as string,
                },
                where: {
                    username: user,
                },
            })
        } catch(error) {
            console.log('Unexpected error during creation of both tokens:', error);
            return false;
        }

        return true;
    }

    /**
     * Only generate the api-token for the user
     * @param   user The user to generate the token for
     * @returns      True if successful, false otherwise
     */
    async generateAPIToken(user: string): Promise<boolean> {
        const authState: IAuthState = this.generateToken(user, 'api_token');

        try {
            await prisma.long_lived_tokens.update({
                data: {
                    api_token: authState.api_token
                },
                where: {
                    username: user
                }
            })
        } catch (error) {
            console.error('Unexpected error accourd while creating api-token:', error);
            return false;
        }

        return true;
    }

    /**
     * Generate an jwt-access-token for a specific user
     * @param user The user to generate the token for
     * @returns A promise containing the generated token if successfuly, undefined otherwise
     */
    async generateAccessToken(user: string): Promise<string | undefined> {
        const expires: Date = new Date();
        expires.setSeconds(expires.getSeconds() + config.auth.access_expiry);
        try {
            return (await new jose.SignJWT()
            .setProtectedHeader({ alg: config.auth.jwt.alg })
            .setJti(nanoid())
            .setExpirationTime(expires)
            .setIssuer(config.auth.jwt.issuer)
            .setIssuedAt(new Date())
            .setSubject(user)
            .sign(new TextEncoder().encode(secrets.acces_jwt)));
        } catch(error) {
            console.error('Unexpected error during access-token generation:', error);
        }
    }

    /**
     * Check if a acces-token is valid
     * @param token The token to verify
     * @returns A promise containing the user if valid, undefined otherwise and when an unexpected error occurs
     */
    async isAccesJWTValid(token: string): Promise<string | undefined> {
        try {
            return (await jose.jwtVerify(token, new TextEncoder().encode(secrets.acces_jwt))).payload.sub;
        } catch(error) {
            if (!(error instanceof JWTExpired || error instanceof JWTInvalid)) {
                console.error('Unexpected error while validating access-token:', error);
            }    
        }
        return;
    }
}