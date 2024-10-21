-- AlterTable
CREATE SEQUENCE long_lived_tokens_id_seq;
ALTER TABLE "long_lived_tokens" ALTER COLUMN "id" SET DEFAULT nextval('long_lived_tokens_id_seq');
ALTER SEQUENCE long_lived_tokens_id_seq OWNED BY "long_lived_tokens"."id";
