/*
  Warnings:

  - You are about to drop the `long_lived_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "long_lived_tokens" DROP CONSTRAINT "long_lived_tokens_username_fkey";

-- DropTable
DROP TABLE "long_lived_tokens";

-- CreateTable
CREATE TABLE "auth_tokens" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "api_token" TEXT NOT NULL,
    "web_token" TEXT NOT NULL,
    "renew" TIMESTAMP(3) NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_tokens_username_key" ON "auth_tokens"("username");

-- AddForeignKey
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_username_fkey" FOREIGN KEY ("username") REFERENCES "users"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
