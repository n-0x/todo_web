/*
  Warnings:

  - You are about to drop the column `userID` on the `api_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `userID` on the `web_tokens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `api_tokens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `web_tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `api_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `web_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "api_tokens" DROP CONSTRAINT "api_tokens_userID_fkey";

-- DropForeignKey
ALTER TABLE "web_tokens" DROP CONSTRAINT "web_tokens_userID_fkey";

-- DropIndex
DROP INDEX "api_tokens_userID_key";

-- DropIndex
DROP INDEX "web_tokens_userID_key";

-- AlterTable
ALTER TABLE "api_tokens" DROP COLUMN "userID",
ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "web_tokens" DROP COLUMN "userID",
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "api_tokens_username_key" ON "api_tokens"("username");

-- CreateIndex
CREATE UNIQUE INDEX "web_tokens_username_key" ON "web_tokens"("username");

-- AddForeignKey
ALTER TABLE "web_tokens" ADD CONSTRAINT "web_tokens_username_fkey" FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_tokens" ADD CONSTRAINT "api_tokens_username_fkey" FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
