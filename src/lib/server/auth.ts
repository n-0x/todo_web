import * as bcrypt from "bcryptjs";
import { prisma } from "./db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import config from "@/config";
import { nanoid } from "nanoid";
import { Status, IStatusWithMeta, secrets, AuthToken, AuthTokenStatus } from "./constants";
import { NextResponse } from "next/server";
import dayjs from "dayjs";

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
    res.cookies.set('web_token', state.web.token as string , { path: '/', httpOnly: true, expires: state.expires, sameSite: "lax", secure: process.env.NODE_ENV !== "development" })
    res.cookies.set('api_token', state.api.token as string , { path: '/api/', httpOnly: true, expires: state.expires, sameSite: "lax", secure: process.env.NODE_ENV !== "development" })
}

export interface IToken {
    token: string,
    refresh: Date
}

export interface IAuthState {
    api: IToken,
    web: IToken,
    expires: Date,
}

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
                web_refresh: true,
                api_refresh: true,
                expires: true,
                username: true,
            }
        }).then((val) => {
            val.forEach(dbState => {
                this.authStates.set(dbState.username, this.dbToAuthState(dbState)!)
            })
            this.cached = true;
            console.log('Finished caching auth-states')
        }).catch(err => console.log('Failed to cache auth-states:', err));
    }

    private dbToAuthState(dbState: {
        username: string,
        web_token: string,
        expires: Date,
        api_token: string,
        api_refresh: Date,
        web_refresh: Date,
    } | null): IAuthState | undefined {
        if (!dbState) {
            return undefined;
        }
        return {
            expires: dbState.expires,
            api: {
                token: dbState.api_token,
                refresh: dbState.api_refresh,
            },
            web: {
                token: dbState.web_token,
                refresh: dbState.web_refresh,
            }
        }
    }

    /**
     * Sets a opeaque token for the user
     * @param user The user to generate the token for
     * @param type Either a `api_token` or `web_token`
     * @returns A reference to the auth-state after the generation
     */
    private setXToken(user: string, type: AuthToken): IAuthState {
        let renewTime = new Date();
        const token: string = nanoid(64);
        let authState: IAuthState | undefined = undefined;
        
        authState = this.authStates.get(user) as IAuthState;
        renewTime.setSeconds(renewTime.getSeconds() + config.auth[type].refresh)
        authState[type].token = token;
        authState[type].refresh = renewTime;

        prisma.auth_tokens.update({
            data: {
                [type + '_token']: authState[type].token,
                [type + '_refresh']: authState[type].refresh,
            },
            where: {
                username: user
            }
        })

        return authState;
    }

    /**
     * Creates an auth-state and sets both `web_token` and `api_token` for a user and adds it to the map. Update if already exists update it.
     * @param user The user to generate the token for
     * @returns    The new auth-state
     */
    async createAuthState(user: string): Promise<IAuthState> {
        const authState: IAuthState = {
            api: {
                token: nanoid(),
                refresh: dayjs().add(config.auth.api.refresh, 's').toDate(),
            },
            web: {
                token: nanoid(),
                refresh: dayjs().add(config.auth.web.refresh, 's').toDate()
            },
            expires: dayjs().add(config.auth.token_epxiry, 's').toDate(),
        }

        this.authStates.set(user, authState);

        prisma.auth_tokens.upsert({
            create: {
                username: user,
                expires: authState.expires,
                api_token: authState.api.token as string,
                web_token: authState.web.token as string,
                api_refresh: authState.api.refresh,
                web_refresh: authState.web.refresh
            },
            update: {
                api_token: authState.api.token as string,
                web_token: authState.web.token as string,
                api_refresh: authState.api.refresh,
                web_refresh: authState.web.refresh
            },
            where: {
                username: user
            }
        }).catch((error) => {
            console.log('Unexpected error during creation of both tokens:', error);
        })

        return authState;
    }

    /**
     * Check if a token is valid. If not found in map due to caching not being finished, check in db. Delete from map on expired
     * @param type  either `web` or `api`
     * @param token the token to check
     * @returns     if the `token` is valid or not or needs to be renewed
     */
    async validateXToken(type: AuthToken, token: string): Promise<AuthTokenStatus> {
        let tokenStatus = AuthTokenStatus.INVALID;
        let state: IAuthState | undefined;

        this.authStates.forEach((val: IAuthState, key: string) => {
            if (val[type].token === token) {
                state = val;
            }
        });

        if (!state && !this.cached) {
            state = this.dbToAuthState(await prisma.auth_tokens.findFirst({
                where: {
                    [type + '_token']: token
                }
            }));
        }

        if (!state) {
            console.log('Token neither found in db or in memory-storage!')
            return AuthTokenStatus.INVALID;
        }

        if (dayjs().isBefore(state.expires)) {
            tokenStatus = AuthTokenStatus.VALID;
        }
        if(dayjs().isAfter(state[type].refresh)) {
            tokenStatus = AuthTokenStatus.SOUR;
        }

        return tokenStatus;
    }


    /**
     * Check if token is valid in database
     * @param type  either `web` or `api`
     * @param token the token to check
     * @returns     if the `token` is valid or not
     */
    async isXTokenValidDB(type: AuthToken, token: string): Promise<boolean> {
        return await prisma.auth_tokens.count({
            where: {
                [type + '_token']: token
            }
        }) == 1;
    }

    

    /**
     * Renew either a `web_token` or `api_token`
     * @param type either `web` or `api`
     * @param old_token the old token
     * @returns         the new auth-state or undifined if the token is invalid
     */
    async renewXToken(type: AuthToken, old_token: string): Promise<IAuthState | undefined> {
        let token: IToken | undefined;
        let stateReference: IAuthState | undefined;

        for (let state of Array.from(this.authStates.values())) {
            if (state[type].token === old_token) {
                token = state[type];
                stateReference = state;
            }
        }

        if (!token) {
            return undefined;
        }

        token.refresh = dayjs().add(config.auth[type].refresh, 's').toDate();

        return stateReference;
    }
}

export const ASP = new AuthStateProvider();