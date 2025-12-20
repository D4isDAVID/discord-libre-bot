CREATE TABLE "ticket_types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ticket_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"guildId" text NOT NULL,
	"emoji" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"channelId" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "ticket_types_guildId_index" ON "ticket_types" USING btree ("guildId");