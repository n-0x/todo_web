/*
  Warnings:

  - You are about to drop the column `ownerID` on the `tokens` table. All the data in the column will be lost.
  - Added the required column `owner_name` to the `tokens` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_ownerID_fkey";

-- AlterTable
ALTER TABLE "tokens" DROP COLUMN "ownerID",
ADD COLUMN     "owner_name" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_owner_name_fkey" FOREIGN KEY ("owner_name") REFERENCES "user"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
