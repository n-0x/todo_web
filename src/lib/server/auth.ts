import * as bcrypt from "bcryptjs";
import { prisma } from "./db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import config from "@/config";
import { nanoid } from "nanoid";
import { Status, IStatusWithMeta, secrets, AuthToken } from "./constants";
import { NextResponse } from "next/server";

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

export function setTokensOnRes(state: IAuthState, res: NextResponse) {
    res.cookies.set('web_token', state.web_token as string , { path: '/', httpOnly: true, expires: state.expires, sameSite: "lax", secure: process.env.NODE_ENV !== "development" })
    res.cookies.set('api_token', state.api_token as string , { path: '/api/', httpOnly: true, expires: state.expires, sameSite: "lax", secure: process.env.NODE_ENV !== "development" })
}

export interface IAuthState {
    api_token?: string,
    web_token?: string,
    expires: Date,
    renew: Date
}

/**
 * The 3 states of an auth-token:
 * - `SOUR`: A token needs to be renewed
 * - `VALID`: Token is valid
 * - `INVALID`: Token is invalid or expired
 */
export enum AuthTokenStatus {
    SOUR, VALID, INVALID
};

class AuthStateProvider {

    /**
     * Map containing all currently cached auth-states
     */
    private authStates = new Map<string, IAuthState>();
    private cached = false;


    /**
     * Cache all auth-states from the db without blocking the loop
     */
    constructor() {
        console.log('Caching auth-states from db...');
        prisma.auth_tokens.findMany({
            select: {
                api_token: true,
                web_token: true,
                expires: true,
                renew: true,
                username: true,
            }
        }).then((val) => {
            val.forEach(dbState => {
                this.authStates.set(dbState.username, {
                    expires: dbState.expires,
                    api_token: dbState.api_token,
                    web_token: dbState.web_token,
                    renew: dbState.renew
                })
            })
            this.cached = true;
            console.log('Finished caching auth-states')
        }).catch(err => console.log('Failed to cache auth-states:', err));
    }

    /**
     * Sets a opeaque token for the user
     * @param user The user to generate the token for
     * @param type Either a `api_token` or `web_token`
     * @returns A reference to the auth-state after the generation
     */
    private setXToken(user: string, type: AuthToken): IAuthState {
        let renew: Date = new Date();
        renew.setSeconds(renew.getSeconds() + config.auth.token_renew)

        const token: string = nanoid(64);
        let authState: IAuthState | undefined = undefined;

        if (this.authStates.has(user)) {
            authState = this.authStates.get(user) as IAuthState;
            authState[type] = token;
        } else {
            let expires: Date = new Date();
            expires.setSeconds(expires.getSeconds() + config.auth.token_epxiry);

            authState = { expires: expires, renew: renew };
            authState[type] = token;
            this.authStates.set(user, authState);
        }

        return authState;
    }

    /**
     * Sets both `web_token` and `api_token` for a user
     * @param user The user to generate the token for
     * @returns    The new auth-state
     */
    async setTokens(user: string): Promise<IAuthState> {
        this.setXToken(user, 'api_token');
        const authState: IAuthState = this.setXToken(user, 'web_token');
        const renew = new Date((new Date().getSeconds() + config.auth.token_renew) * 1e3);
        authState.renew = renew;

        prisma.auth_tokens.upsert({
            create: {
                username: user,
                expires: authState.expires,
                renew: renew,
                api_token: authState.api_token as string,
                web_token: authState.web_token as string,
            },
            update: {
                username: user,
                renew: renew,
                api_token: authState.api_token as string,
                web_token: authState.web_token as string,
            },
            where: {
                username: user,
            },
        }).catch((error) => {
            console.log('Unexpected error during creation of both tokens:', error);
        })

        return authState;
    }

    /**
     * Check if a token is valid. If not found in map due to caching not being finished, check in db. Delete from map on expired
     * @param type  either `web_token` or `api_token`
     * @param token the token to check
     * @returns     if the `token` is valid or not or needs to be renewed
     */
    async isXTokenValid(type: "web_token" | "api_token", token: string): Promise<AuthTokenStatus> {
        let valid = AuthTokenStatus.INVALID;
        let force = false; // enforce to return false if the token is expired

        this.authStates.forEach((val: IAuthState, key: string) => {
            if (val[type] === token) {
                if (val.expires > new Date()) {
                    this.authStates.delete(key);
                    force = true;
                } else {
                    valid = AuthTokenStatus.VALID;
                }
            }
        });

        if (!valid && !this.cached && !force) {
            valid = await this.isXTokenValidDB(type, token) ? AuthTokenStatus.VALID : AuthTokenStatus.INVALID;
        }

        return valid;
    }


    /**
     * Check if token is valid in database
     * @param type  either `web_token` or `api_token`
     * @param token the token to check
     * @returns     if the `token` is valid or not
     */
    async isXTokenValidDB(type: "web_token" | "api_token", token: string): Promise<boolean> {
        return await prisma.auth_tokens.count({
            where: {
                [type]: token
            }
        }) == 1;
    }

    /**
     * Renew both `web_token` and `api_token`
     * @param api_token the old `api_token`
     * @param web_token the old `web_token`
     * @returns         the new auth-state
     */
    async renewTokens(api_token: string, web_token: string): Promise<IAuthState | undefined> {
        let user: string | undefined = undefined;
        this.authStates.forEach((val: IAuthState, key: string) => {
            if (val.api_token === api_token && val.web_token == web_token) {
                user = key;
            }
        })

        if (!user) {
            return undefined;
        }

        return await this.setTokens(user);
    }
}

export const ASP = new AuthStateProvider();