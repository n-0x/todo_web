-- CreateTable
CREATE TABLE "auth" (
    "id" SERIAL NOT NULL,
    "token_id" INTEGER NOT NULL,
    "ownerID" INTEGER NOT NULL,

    CONSTRAINT "auth_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "auth" ADD CONSTRAINT "auth_ownerID_fkey" FOREIGN KEY ("ownerID") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
