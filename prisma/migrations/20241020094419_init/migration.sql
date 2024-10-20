/*
  Warnings:

  - You are about to drop the `blacklisted_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "blacklisted_tokens" DROP CONSTRAINT "blacklisted_tokens_owner_name_fkey";

-- DropTable
DROP TABLE "blacklisted_tokens";

-- CreateTable
CREATE TABLE "web_tokens" (
    "userID" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "api_tokens" (
    "userID" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "web_tokens_userID_key" ON "web_tokens"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "api_tokens_userID_key" ON "api_tokens"("userID");

-- AddForeignKey
ALTER TABLE "web_tokens" ADD CONSTRAINT "web_tokens_userID_fkey" FOREIGN KEY ("userID") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_tokens" ADD CONSTRAINT "api_tokens_userID_fkey" FOREIGN KEY ("userID") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
