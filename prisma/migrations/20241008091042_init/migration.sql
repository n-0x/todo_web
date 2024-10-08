/*
  Warnings:

  - A unique constraint covering the columns `[token_id]` on the table `auth` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "auth_token_id_key" ON "auth"("token_id");
