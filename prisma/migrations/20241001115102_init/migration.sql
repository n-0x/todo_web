-- CreateTable
CREATE TABLE "auth_users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "auth_users_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "auth_users" ADD CONSTRAINT "auth_users_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
