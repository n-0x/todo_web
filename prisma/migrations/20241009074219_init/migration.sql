/*
  Warnings:

  - You are about to drop the column `token_id` on the `tokens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[jti]` on the table `tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jti` to the `tokens` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "tokens_token_id_key";

-- AlterTable
ALTER TABLE "tokens" DROP COLUMN "token_id",
ADD COLUMN     "jti" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tokens_jti_key" ON "tokens"("jti");
