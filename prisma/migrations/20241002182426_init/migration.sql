/*
  Warnings:

  - You are about to drop the `auth_users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "auth_users" DROP CONSTRAINT "auth_users_username_fkey";

-- DropTable
DROP TABLE "auth_users";
