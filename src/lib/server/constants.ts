/**
 * Constants
 * Everything must be compatible with the edge runtime
 */
export const secrets = {
    postgres: {
        db_url: process.env.DATABASE_URL as string
    },
    mongodb: {
        host: process.env.MONGODB_HOST as string,
        user: process.env.MONGODB_USER as string,
        password: process.env.MONGODB_PASSWORD as string
    },
    s2s_secret: process.env.S2S_SECRET as string
}

export const Status = {
    OK: 200,
    FOUND: 302,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
}

export const PORT: number = Number(process.env.PORT) || 3000;

export interface IStatusWithMeta {
    type?: string,
    code: number
}

export type AuthToken = 'api' | 'web';

export const TimeUnit = {
    SECONDS: 1,
    MINUTES: 60,
    HOURS:   3_600,
    DAYS:    86_400,
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