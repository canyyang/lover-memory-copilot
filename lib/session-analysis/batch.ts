import { asc, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { imports, messages, sessions } from '@/lib/db/schema';
import { analyzeSingleSession } from './analyze';
import type { SessionAnalysisInput } from './types';

export type BatchAnalyzeSessionsResult = {
  importId: string;
  totalSessions: number;
  successCount: number;
  failureCount: number;
  results: Array<{
    sessionId: string;
    title: string | null;
    success: boolean;
    error?: string;
    summary?: string;
    topicTags?: string[];
    moodLabel?: string;
    signalLabel?: string;
    isKeySession?: boolean;
  }>;
};

export async function analyzeLatestImportSessions(): Promise<BatchAnalyzeSessionsResult> {
  // 1. 找最近一次已解析完成的导入
  const latestImportRows = await db
    .select()
    .from(imports)
    .where(eq(imports.status, 'parsed'))
    .orderBy(desc(imports.createdAt))
    .limit(1);

  if (latestImportRows.length === 0) {
    throw new Error('没有找到可分析的导入记录，请先完成导入。');
  }

  const currentImport = latestImportRows[0];

  // 2. 取这个导入下的全部 sessions
  const sessionRows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.importId, currentImport.id))
    .orderBy(asc(sessions.startAt));

  if (sessionRows.length === 0) {
    throw new Error('当前导入下没有 session 记录。');
  }

  // 3. 取这个导入下的全部 messages
  const messageRows = await db
    .select()
    .from(messages)
    .where(eq(messages.importId, currentImport.id))
    .orderBy(asc(messages.sentAt));

  const results: BatchAnalyzeSessionsResult['results'] = [];

  // 4. 串行分析每个 session
  for (const session of sessionRows) {
    try {
      const startAt = new Date(session.startAt).getTime();
      const endAt = new Date(session.endAt).getTime();

      const sessionMessages = messageRows.filter((msg) => {
        const sentAt = new Date(msg.sentAt).getTime();
        return sentAt >= startAt && sentAt <= endAt;
      });

      if (sessionMessages.length === 0) {
        results.push({
          sessionId: session.id,
          title: session.title,
          success: false,
          error: '当前 session 没有关联到消息',
        });
        continue;
      }

      const analysisInput: SessionAnalysisInput = {
        sessionId: session.id,
        relationId: session.relationId,
        importId: session.importId,
        title: session.title,
        startAt: new Date(session.startAt).toISOString(),
        endAt: new Date(session.endAt).toISOString(),
        messageCount: session.messageCount,
        messages: sessionMessages.map((msg) => ({
          role: msg.role as 'self' | 'partner',
          content: msg.content,
          sentAt: new Date(msg.sentAt).toISOString(),
        })),
      };

      const analysis = await analyzeSingleSession(analysisInput);

      // 5. 写回 sessions 表
      await db
        .update(sessions)
        .set({
          summary: analysis.summary,
          topicTags: analysis.topicTags,
          moodLabel: analysis.moodLabel,
          signalLabel: analysis.signalLabel,
          isKeySession: analysis.isKeySession,
        })
        .where(eq(sessions.id, session.id));

      results.push({
        sessionId: session.id,
        title: session.title,
        success: true,
        summary: analysis.summary,
        topicTags: analysis.topicTags,
        moodLabel: analysis.moodLabel,
        signalLabel: analysis.signalLabel,
        isKeySession: analysis.isKeySession,
      });
    } catch (error) {
      results.push({
        sessionId: session.id,
        title: session.title,
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  const successCount = results.filter((item) => item.success).length;
  const failureCount = results.length - successCount;

  return {
    importId: currentImport.id,
    totalSessions: sessionRows.length,
    successCount,
    failureCount,
    results,
  };
}