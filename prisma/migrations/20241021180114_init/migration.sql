/*
  Warnings:

  - You are about to drop the `api_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `web_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "api_tokens" DROP CONSTRAINT "api_tokens_username_fkey";

-- DropForeignKey
ALTER TABLE "web_tokens" DROP CONSTRAINT "web_tokens_username_fkey";

-- DropTable
DROP TABLE "api_tokens";

-- DropTable
DROP TABLE "user";

-- DropTable
DROP TABLE "web_tokens";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "pass_hash" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "long_lived_tokens" (
    "id" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "api_token" TEXT NOT NULL,
    "web_token" TEXT NOT NULL,
    "expiry" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "long_lived_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "long_lived_tokens_username_key" ON "long_lived_tokens"("username");

-- AddForeignKey
ALTER TABLE "long_lived_tokens" ADD CONSTRAINT "long_lived_tokens_username_fkey" FOREIGN KEY ("username") REFERENCES "users"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
