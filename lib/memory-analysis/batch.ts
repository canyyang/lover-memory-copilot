import { randomUUID } from 'crypto';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { imports, memoryCards, sessions } from '@/lib/db/schema';
import { analyzeMemoryCards } from './analyze';
import type {
  MemoryAnalysisInput,
  MemoryCardDraft,
  SessionMemoryEvidence,
} from './types';

export type BuildMemoryCardsResult = {
  relationId: string;
  importId: string;
  sourceSessionCount: number;
  generatedCount: number;
  savedCount: number;
  memoryCards: Array<
    MemoryCardDraft & {
      id: string;
    }
  >;
};

function normalizeEvidenceSessions(rows: typeof sessions.$inferSelect[]): SessionMemoryEvidence[] {
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

function dedupeMemoryCards(cards: MemoryCardDraft[]): MemoryCardDraft[] {
  const seen = new Set<string>();
  const result: MemoryCardDraft[] = [];

  for (const card of cards) {
    const key = `${card.memoryType}::${card.title.trim()}::${card.content.trim()}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(card);
  }

  return result;
}

function filterEvidenceSessionIds(
  cards: MemoryCardDraft[],
  validSessionIds: Set<string>
): MemoryCardDraft[] {
  return cards
    .map((card) => {
      const filteredIds = card.evidenceSessionIds.filter((id) => validSessionIds.has(id));

      return {
        ...card,
        evidenceSessionIds: filteredIds,
      };
    })
    .filter((card) => card.evidenceSessionIds.length > 0);
}

export async function buildLatestRelationMemoryCards(): Promise<BuildMemoryCardsResult> {
  // 1. 找最近一次已解析完成的导入记录
  const latestImportRows = await db
    .select()
    .from(imports)
    .where(eq(imports.status, 'parsed'))
    .orderBy(desc(imports.createdAt))
    .limit(1);

  if (latestImportRows.length === 0) {
    throw new Error('没有找到可用于提炼长期记忆的导入记录。');
  }

  const currentImport = latestImportRows[0];

  // 2. 读取该导入下的全部 session
  const sessionRows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.importId, currentImport.id))
    .orderBy(desc(sessions.startAt));

  if (sessionRows.length === 0) {
    throw new Error('当前导入下没有可用的 session。');
  }

  const evidenceSessions = normalizeEvidenceSessions(sessionRows);

  const analysisInput: MemoryAnalysisInput = {
    relationId: currentImport.relationId,
    evidenceSessions,
  };

  // 3. 调用 Qwen 提炼长期记忆
  const analysis = await analyzeMemoryCards(analysisInput);

  // 4. 模型结果做二次清洗
  const validSessionIds = new Set(sessionRows.map((session) => session.id));

  const cleanedCards = filterEvidenceSessionIds(
    dedupeMemoryCards(analysis.memoryCards),
    validSessionIds
  );

  // 5. 先删除当前 relation 下已有的记忆卡片
  await db.delete(memoryCards).where(eq(memoryCards.relationId, currentImport.relationId));

  // 6. 批量写入新的记忆卡片
  const rowsToInsert = cleanedCards.map((card) => ({
    id: randomUUID(),
    relationId: currentImport.relationId,
    memoryType: card.memoryType,
    title: card.title,
    content: card.content,
    evidenceSessionIds: card.evidenceSessionIds,
    confidence: card.confidence,
    status: 'active' as const,
  }));

  if (rowsToInsert.length > 0) {
    await db.insert(memoryCards).values(rowsToInsert);
  }

  return {
    relationId: currentImport.relationId,
    importId: currentImport.id,
    sourceSessionCount: sessionRows.length,
    generatedCount: analysis.memoryCards.length,
    savedCount: rowsToInsert.length,
    memoryCards: rowsToInsert,
  };
}