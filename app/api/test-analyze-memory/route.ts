import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { imports, sessions } from '@/lib/db/schema';
import { analyzeMemoryCards } from '@/lib/memory-analysis/analyze';
import type { MemoryAnalysisInput } from '@/lib/memory-analysis/types';

export async function GET() {
  try {
    // 1. 找最近一次已解析完成的导入记录
    const latestImportRows = await db
      .select()
      .from(imports)
      .where(eq(imports.status, 'parsed'))
      .orderBy(desc(imports.createdAt))
      .limit(1);

    if (latestImportRows.length === 0) {
      return Response.json(
        {
          success: false,
          message: '没有找到可用于提炼长期记忆的导入记录。',
        },
        { status: 400 }
      );
    }

    const currentImport = latestImportRows[0];

    // 2. 读取该导入下的全部 sessions
    const sessionRows = await db
      .select()
      .from(sessions)
      .where(eq(sessions.importId, currentImport.id))
      .orderBy(desc(sessions.startAt));

    if (sessionRows.length === 0) {
      return Response.json(
        {
          success: false,
          message: '当前导入下没有可用的 session。',
        },
        { status: 400 }
      );
    }

    const input: MemoryAnalysisInput = {
      relationId: currentImport.relationId,
      evidenceSessions: sessionRows.map((session) => ({
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
      })),
    };

    const analysis = await analyzeMemoryCards(input);

    return Response.json({
      success: true,
      message: '长期关系记忆提炼成功',
      data: {
        inputPreview: {
          relationId: input.relationId,
          evidenceSessionCount: input.evidenceSessions.length,
          firstSessions: input.evidenceSessions.slice(0, 3),
        },
        analysis,
      },
    });
  } catch (error) {
    console.error('长期关系记忆提炼失败:', error);

    return Response.json(
      {
        success: false,
        message: '长期关系记忆提炼失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}