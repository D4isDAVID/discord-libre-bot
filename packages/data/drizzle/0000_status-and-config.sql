CREATE TABLE "configs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "configs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"guildId" text,
	"prefix" text NOT NULL,
	"features" text[] NOT NULL,
	CONSTRAINT "configs_guildId_unique" UNIQUE("guildId")
);
--> statement-breakpoint
CREATE TABLE "statuses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "statuses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"status" text NOT NULL,
	"afk" boolean NOT NULL,
	"activityType" integer NOT NULL,
	"activityName" text NOT NULL,
	"activityState" text,
	"activityUrl" text
);
--> statement-breakpoint
CREATE INDEX "configs_guildId_index" ON "configs" USING btree ("guildId");