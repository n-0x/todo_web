/*
  Warnings:

  - You are about to drop the column `renew` on the `auth_tokens` table. All the data in the column will be lost.
  - Added the required column `api_renew` to the `auth_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `web_renew` to the `auth_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "auth_tokens" DROP COLUMN "renew",
ADD COLUMN     "api_renew" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "web_renew" TIMESTAMP(3) NOT NULL;
