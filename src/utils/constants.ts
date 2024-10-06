import { ok } from "assert";

type Secrets = {
    postgres: {
        db_url: string
    },
    mongodb: {
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
        username: process.env.MONGODB_USERNAME as string,
        password: process.env.MONGODB_PASSWORD as string
    },
    jwt: process.env.JWT_SECRET as string
}