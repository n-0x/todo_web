/*
  Warnings:

  - You are about to drop the `auth` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "auth" DROP CONSTRAINT "auth_ownerID_fkey";

-- DropTable
DROP TABLE "auth";

-- CreateTable
CREATE TABLE "tokens" (
    "id" SERIAL NOT NULL,
    "ownerID" INTEGER NOT NULL,
    "token_id" TEXT NOT NULL,
    "valid" BOOLEAN NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tokens_token_id_key" ON "tokens"("token_id");

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_ownerID_fkey" FOREIGN KEY ("ownerID") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
