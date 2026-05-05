import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { memoryCards, sessions } from '@/lib/db/schema';
import { classifyRelationshipQuestionIntent } from './intent';
import { getRetrievalStrategy } from './retrieval-strategy';
import type {
  RelationshipQuestionInput,
  RetrievedMemoryEvidence,
  RetrievedSessionEvidence,
} from './types';

export type BuildQAContextParams = {
  relationId: string;
  question: string;
};

function normalizeText(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function extractQuestionKeywords(question: string): string[] {
  const raw = question
    .replace(/[？?！!，,。.\s]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);

  const manualKeywords = [
    '最近',
    '主要',
    '问题',
    '卡',
    '在意',
    '容易',
    '关系',
    '紧张',
    '回暖',
    '信号',
    '积极',
    '风险',
    '长期',
    '注意',
    '未来',
    '不安',
    '安抚',
    '互动',
    '回避',
  ];

  const merged = [...raw, ...manualKeywords.filter((kw) => question.includes(kw))];

  return [...new Set(merged)].filter((kw) => kw.length >= 1);
}

function countKeywordHits(texts: string[], keywords: string[]): number {
  let score = 0;

  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword);
    if (!normalizedKeyword) continue;

    for (const text of texts) {
      if (normalizeText(text).includes(normalizedKeyword)) {
        score += 1;
      }
    }
  }

  return score;
}

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

function scoreSession(
  session: RetrievedSessionEvidence,
  questionKeywords: string[],
  preferredSignalLabels: string[],
  preferredMoodLabels: string[]
): number {
  let score = 0;

  if (session.isKeySession) {
    score += 4;
  }

  if (session.signalLabel && preferredSignalLabels.includes(session.signalLabel)) {
    score += 4;
  }

  if (session.moodLabel && preferredMoodLabels.includes(session.moodLabel)) {
    score += 3;
  }

  const keywordHitScore = countKeywordHits(
    [session.title ?? '', session.summary ?? '', ...(session.topicTags ?? [])],
    questionKeywords
  );
  score += keywordHitScore * 2;

  score += Math.min(session.messageCount, 20) * 0.05;

  return score;
}

function scoreMemory(
  memory: RetrievedMemoryEvidence,
  questionKeywords: string[],
  preferredMemoryTypes: string[]
): number {
  let score = 0;

  if (preferredMemoryTypes.includes(memory.memoryType)) {
    score += 5;
  }

  const keywordHitScore = countKeywordHits(
    [memory.title, memory.content],
    questionKeywords
  );
  score += keywordHitScore * 2;

  if (memory.confidence === 'high') {
    score += 2;
  } else if (memory.confidence === 'medium') {
    score += 1;
  }

  score += Math.min(memory.evidenceSessionIds.length, 5) * 0.5;

  return score;
}

export async function buildRelationshipQAContext(
  params: BuildQAContextParams
): Promise<RelationshipQuestionInput> {
  const { relationId, question } = params;

  const intent = classifyRelationshipQuestionIntent(question);
  const strategy = getRetrievalStrategy(intent);
  const questionKeywords = extractQuestionKeywords(question);

  // 1. 读取当前 relation 下所有 sessions
  const sessionRows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.relationId, relationId))
    .orderBy(desc(sessions.startAt));

  const normalizedSessions = normalizeSessionEvidence(sessionRows);

  const rankedSessions = normalizedSessions
    .map((session, index) => ({
      session,
      score:
        scoreSession(
          session,
          questionKeywords,
          strategy.preferredSignalLabels,
          strategy.preferredMoodLabels
        ) +
        // 让更新近的 session 微微优先
        Math.max(0, 2 - index * 0.1),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, strategy.maxSessionEvidence)
    .map((item) => item.session);

  // 2. 读取当前 relation 下 active 的 memory cards
  const memoryRows = await db
    .select()
    .from(memoryCards)
    .where(eq(memoryCards.relationId, relationId))
    .orderBy(desc(memoryCards.createdAt));

  const normalizedMemories = normalizeMemoryEvidence(memoryRows).filter(
    (memory) => memory.confidence !== 'low' || memory.content.length > 0
  );

  const rankedMemories = normalizedMemories
    .map((memory, index) => ({
      memory,
      score:
        scoreMemory(memory, questionKeywords, strategy.preferredMemoryTypes) +
        Math.max(0, 1 - index * 0.05),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, strategy.maxMemoryEvidence)
    .map((item) => item.memory);

    return {
      relationId,
      question,
      intent,
      strategy,
      sessions: rankedSessions,
      memories: rankedMemories,
    };
}