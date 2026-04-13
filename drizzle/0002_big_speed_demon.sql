ALTER TABLE "sessions" ADD COLUMN "topic_tags" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "mood_label" text;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "signal_label" text;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "is_key_session" boolean DEFAULT false NOT NULL;