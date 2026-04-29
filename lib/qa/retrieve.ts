import { and, desc, eq, or } from 'drizzle-orm';
import { db } from '@/lib/db';
import { memoryCards, sessions } from '@/lib/db/schema';
import type {
  RelationshipQuestionInput,
  RetrievedMemoryEvidence,
  RetrievedSessionEvidence,
} from './types';

export type BuildQAContextParams = {
  relationId: string;
  question: string;
};

const MAX_SESSION_EVIDENCE = 8;
const MAX_MEMORY_EVIDENCE = 6;

function normalizeSessionEvidence(
  rows: typeof sessions.$inferSelect[]
): RetrievedSessionEvidence[] {
  return rows.map((session) => ({
    sessionId: session.id,
    title: session.title,
    summary: session.summary,
    topicTags: Array.isArray(session.topicTags) ? session.topicTags : [],
    moodLabel: session.moodLabel,
    signalLabel: session.signalLabel,
    isKeySession: session.isKeySession,
    startAt: new Date(session.startAt).toISOString(),
    endAt: new Date(session.endAt).toISOString(),
    messageCount: session.messageCount,
  }));
}

function normalizeMemoryEvidence(
  rows: typeof memoryCards.$inferSelect[]
): RetrievedMemoryEvidence[] {
  return rows.map((card) => ({
    memoryCardId: card.id,
    memoryType: card.memoryType,
    title: card.title,
    content: card.content,
    confidence: card.confidence,
    evidenceSessionIds: Array.isArray(card.evidenceSessionIds)
      ? card.evidenceSessionIds
      : [],
  }));
}

function dedupeSessions(
  rows: RetrievedSessionEvidence[]
): RetrievedSessionEvidence[] {
  const seen = new Set<string>();
  const result: RetrievedSessionEvidence[] = [];

  for (const row of rows) {
    if (seen.has(row.sessionId)) {
      continue;
    }

    seen.add(row.sessionId);
    result.push(row);
  }

  return result;
}

export async function buildRelationshipQAContext(
  params: BuildQAContextParams
): Promise<RelationshipQuestionInput> {
  const { relationId, question } = params;

  // 1. 先取最近的关键 session
  const keySessionRows = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.relationId, relationId),
        eq(sessions.isKeySession, true)
      )
    )
    .orderBy(desc(sessions.startAt))
    .limit(MAX_SESSION_EVIDENCE);

  // 2. 再取最近的一般 session 作为补充
  const recentSessionRows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.relationId, relationId))
    .orderBy(desc(sessions.startAt))
    .limit(MAX_SESSION_EVIDENCE);

  // 合并去重，优先保留关键 session
  const mergedSessions = dedupeSessions([
    ...normalizeSessionEvidence(keySessionRows),
    ...normalizeSessionEvidence(recentSessionRows),
  ]).slice(0, MAX_SESSION_EVIDENCE);

  // 3. 取 active 的长期关系记忆卡片
  const memoryRows = await db
    .select()
    .from(memoryCards)
    .where(
      and(
        eq(memoryCards.relationId, relationId),
        eq(memoryCards.status, 'active')
      )
    )
    .orderBy(desc(memoryCards.createdAt))
    .limit(MAX_MEMORY_EVIDENCE);

  const mergedMemories = normalizeMemoryEvidence(memoryRows);

  return {
    relationId,
    question,
    sessions: mergedSessions,
    memories: mergedMemories,
  };
}