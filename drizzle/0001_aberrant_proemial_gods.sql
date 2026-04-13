CREATE TABLE "imports" (
	"id" text PRIMARY KEY NOT NULL,
	"relation_id" text NOT NULL,
	"file_name" text NOT NULL,
	"source_type" text NOT NULL,
	"status" text NOT NULL,
	"raw_file_path" text,
	"message_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"relation_id" text NOT NULL,
	"import_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"sent_at" timestamp with time zone NOT NULL,
	"raw_message_id" text,
	"raw_payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"relation_id" text NOT NULL,
	"import_id" text NOT NULL,
	"title" text,
	"summary" text,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
