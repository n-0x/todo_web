/*
  Warnings:

  - You are about to drop the column `api_token` on the `long_lived_tokens` table. All the data in the column will be lost.
  - Added the required column `api_ref_token` to the `long_lived_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "long_lived_tokens" DROP COLUMN "api_token",
ADD COLUMN     "api_ref_token" TEXT NOT NULL;
