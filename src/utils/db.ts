import { PrismaClient } from '@prisma/client'
import { MongoClient } from 'mongodb';
import { secrets } from './constants';

const prisma = new PrismaClient();

prisma.$connect().catch(error => console.error(error));

export const user = prisma.user;

MongoClient.connect('mongodb://localhost:27017/todo_web', {
    auth: {
        username: secrets.mongodb.username,
        password: secrets.mongodb.password
    }
})