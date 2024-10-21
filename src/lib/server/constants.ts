export const secrets = {
    postgres: {
        db_url: process.env.DATABASE_URL as string
    },
    mongodb: {
        host: process.env.MONGODB_HOST as string,
        user: process.env.MONGODB_USER as string,
        password: process.env.MONGODB_PASSWORD as string
    },
    acces_jwt: process.env.ACCESS_JWT_SECRET as string,
    refresh_jwt: process.env.REFRESH_JWT_SECRET as string,
}

export const Status = {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
}

export interface IStatusWithMeta {
    type?: string,
    code: number
}

export const Time = {
    SECONDS: 1,
    MINUTES: 60,
    DAYS: 86_400,
}