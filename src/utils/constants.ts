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
    jwt: string
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
    jwt: process.env.JWT_SECRET as string
}