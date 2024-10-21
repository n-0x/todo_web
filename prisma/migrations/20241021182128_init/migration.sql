/*
  Warnings:

  - You are about to drop the column `expiry` on the `long_lived_tokens` table. All the data in the column will be lost.
  - Added the required column `expires` to the `long_lived_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "long_lived_tokens" DROP COLUMN "expiry",
ADD COLUMN     "expires" TIMESTAMP(3) NOT NULL;
