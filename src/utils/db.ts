import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

prisma.$connect().catch(error => console.error(error));

export const user = prisma.user;