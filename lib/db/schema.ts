import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
  
  export const users = pgTable('users', {
    id: text('id').primaryKey(),
    name: text('name'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  });
  
  export const relations = pgTable('relations', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    ownerId: text('owner_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  });
  
  export const imports = pgTable('imports', {
    id: text('id').primaryKey(),
    relationId: text('relation_id').notNull(),
    fileName: text('file_name').notNull(),
    sourceType: text('source_type').notNull(),
    status: text('status').notNull(), // uploaded / parsed / failed
    rawFilePath: text('raw_file_path'),
    messageCount: integer('message_count').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  });
  
  export const messages = pgTable('messages', {
    id: text('id').primaryKey(),
    relationId: text('relation_id').notNull(),
    importId: text('import_id').notNull(),
    role: text('role').notNull(), // self / partner
    content: text('content').notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true }).notNull(),
    rawMessageId: text('raw_message_id'),
    rawPayload: jsonb('raw_payload').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  });
  
  export const sessions = pgTable('sessions', {
    id: text('id').primaryKey(),
    relationId: text('relation_id').notNull(),
    importId: text('import_id').notNull(),
    title: text('title'),
    summary: text('summary'),
  
    topicTags: jsonb('topic_tags').$type<string[]>().default([]).notNull(),
    moodLabel: text('mood_label'),
    signalLabel: text('signal_label'),
    isKeySession: boolean('is_key_session').default(false).notNull(),
  
    startAt: timestamp('start_at', { withTimezone: true }).notNull(),
    endAt: timestamp('end_at', { withTimezone: true }).notNull(),
    messageCount: integer('message_count').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  });

  export const memoryCards = pgTable('memory_cards', {
    id: text('id').primaryKey(),
    relationId: text('relation_id').notNull(),
  
    memoryType: text('memory_type').notNull(), // partner_pattern / user_pattern / interaction_pattern / unresolved_issue / positive_signal
    title: text('title').notNull(),
    content: text('content').notNull(),
  
    evidenceSessionIds: jsonb('evidence_session_ids').$type<string[]>().default([]).notNull(),
  
    confidence: text('confidence').notNull(), // high / medium / low
    status: text('status').default('active').notNull(), // active / hidden
  
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  });