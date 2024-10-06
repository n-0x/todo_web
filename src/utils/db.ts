import { Prisma, PrismaClient } from '@prisma/client'
import { MongoClient } from 'mongodb';
import { secrets } from './constants';
import { DefaultArgs } from '@prisma/client/runtime/library';

const prismaClient = new PrismaClient();

prismaClient.$connect().catch(error => console.error(error));

type PrismaType = {
    user: Prisma.userDelegate<DefaultArgs>
}

export const prisma: PrismaType = {
    user: prismaClient.user
};

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
    db: Promise<MongoClient>;

    constructor() {
        this.db =  MongoClient.connect('mongodb://localhost:27017/todo_web', {
            auth: {
                username: secrets.mongodb.username,
                password: secrets.mongodb.password
            }
        })
    }
}