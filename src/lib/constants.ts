import { ok } from "assert";

type Secrets = {
    postgres: {
        db_url: string
    },
    mongodb: {
        host: string,
        username: string,
        password: string
    },
    acces_jwt: string,
    refresh_jwt: string
}

export const secrets: Secrets = {
    postgres: {
        db_url: process.env.DATABASE_URL as string
    },
    mongodb: {
        host: process.env.MONGODB_HOST as string,
        username: process.env.MONGODB_USERNAME as string,
        password: process.env.MONGODB_PASSWORD as string
    },
    acces_jwt: process.env.ACCESS_JWT_SECRET as string,
    refresh_jwt: process.env.REFRESH_JWT_SECRET as string,
}
export const WebResult = {
    auth: {
        SUCCESS: { message: 'Welcome!', code: 200 },
        EMAIL_EXISTS: { message: 'This email is already in use!', code: 409 },
        USERNAME_EXISTS: { message: 'This username is not available!', code: 409 },
        UNKNOWN_ERROR: { message: 'Unknown error, report to admin immediately!', code: 500 },
        WRONG_CREDENTIALS: { message: 'Either your username or your password is wrong!', code: 401 }
    },
    general: {
        INVALID_REQUEST: { message: 'Invalid request!', code: 400 }
    }
}
export type WebResultType = { message: string, code: number };