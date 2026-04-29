CREATE TABLE "qa_records" (
	"id" text PRIMARY KEY NOT NULL,
	"relation_id" text NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"key_points" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"referenced_session_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"referenced_memory_card_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
