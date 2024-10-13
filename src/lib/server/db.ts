import { Prisma, PrismaClient } from '@prisma/client'
import { Collection, Db, MongoClient } from 'mongodb';
import { secrets } from './constants';
import { DefaultArgs } from '@prisma/client/runtime/library';

const prismaClient = new PrismaClient();

prismaClient.$connect().catch(error => console.error(error));

export const prisma: {
    user: Prisma.userDelegate<DefaultArgs>,
    blacklisted_tokens: Prisma.blacklisted_tokensDelegate<DefaultArgs>
} = {
    user: prismaClient.user,
    blacklisted_tokens: prismaClient.blacklisted_tokens
};

export function invalidateRefreshToken(jti: string, user: string, expires: Date) {
    prisma.blacklisted_tokens.create({
        data: {
            expires: expires,
            jti: jti,
            owner_name: user,
        }
    })
}

MongoClient.connect('mongodb://localhost:27017/todo_web', {
    auth: {
        username: secrets.mongodb.username,
        password: secrets.mongodb.password
    }
})
.then((client) => {
    client.db
})

class MongoDB {
    boards: Promise<Collection<any>> | undefined;

    db: Db | undefined;
    constructor() {
        MongoClient.connect(secrets.mongodb.host, {
            auth: {
                username: secrets.mongodb.username,
                password: secrets.mongodb.password
            }
        }).then(client => {
            this.db = client.db('todo_web');
            this.boards = this.db.createCollection<any>('boards');
        })
    }

    async createBoard(boardName: string) {
        await (await this.boards)?.insertOne({
            title: boardName,
            tasks: []
        });
    }
}

export const mongodb = new MongoDB();