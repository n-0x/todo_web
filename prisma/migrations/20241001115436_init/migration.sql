/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[auth_toke]` on the table `auth_users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `auth_toke` to the `auth_users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "auth_users" DROP CONSTRAINT "auth_users_username_fkey";

-- AlterTable
ALTER TABLE "auth_users" ADD COLUMN     "auth_toke" TEXT NOT NULL;

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "pass_hash" TEXT NOT NULL,
    "pass_salt" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "auth_users_auth_toke_key" ON "auth_users"("auth_toke");

-- AddForeignKey
ALTER TABLE "auth_users" ADD CONSTRAINT "auth_users_username_fkey" FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
