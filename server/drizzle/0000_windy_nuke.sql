CREATE TABLE "secrets" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "secrets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"secret" varchar(255) NOT NULL,
	"decryptionKey" varchar(255),
	"oneTime" integer DEFAULT 0,
	"destroyAfter" timestamp,
	"created_at" timestamp (3) DEFAULT now(),
	"updated_at" timestamp (3) DEFAULT now()
);
