/*
  Warnings:

  - You are about to drop the `tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_owner_name_fkey";

-- DropTable
DROP TABLE "tokens";

-- CreateTable
CREATE TABLE "blacklisted_tokens" (
    "id" SERIAL NOT NULL,
    "owner_name" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blacklisted_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blacklisted_tokens_jti_key" ON "blacklisted_tokens"("jti");

-- AddForeignKey
ALTER TABLE "blacklisted_tokens" ADD CONSTRAINT "blacklisted_tokens_owner_name_fkey" FOREIGN KEY ("owner_name") REFERENCES "user"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
