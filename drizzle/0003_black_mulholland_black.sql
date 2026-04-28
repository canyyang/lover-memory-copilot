CREATE TABLE "memory_cards" (
	"id" text PRIMARY KEY NOT NULL,
	"relation_id" text NOT NULL,
	"memory_type" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"evidence_session_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"confidence" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
