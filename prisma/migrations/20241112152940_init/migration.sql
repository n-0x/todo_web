/*
  Warnings:

  - You are about to drop the column `api_renew` on the `auth_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `web_renew` on the `auth_tokens` table. All the data in the column will be lost.
  - Added the required column `api_refresh` to the `auth_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `web_refresh` to the `auth_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "auth_tokens" DROP COLUMN "api_renew",
DROP COLUMN "web_renew",
ADD COLUMN     "api_refresh" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "web_refresh" TIMESTAMP(3) NOT NULL;
