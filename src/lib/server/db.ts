import { Prisma, PrismaClient } from '@prisma/client'
import { Collection, Db, MongoClient } from 'mongodb';
import { secrets } from './constants';
import { DefaultArgs } from '@prisma/client/runtime/library';

const prismaClient = new PrismaClient();

prismaClient.$connect().catch(error => console.error(error));

export const prisma = {
    user: prismaClient.user,
    web_tokens: prismaClient.web_tokens,
    api_tokens: prismaClient.api_tokens
};

class MongoDB {
    boards: Promise<Collection<any>> | undefined;

    db: Db | undefined;
    constructor() {
        MongoClient.connect(secrets.mongodb.host, {
            auth: {
                username: secrets.mongodb.user,
                password: secrets.mongodb.password
            },
            authMechanism: 'SCRAM-SHA-256'
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