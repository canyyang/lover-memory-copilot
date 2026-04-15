import { asc, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { messages, sessions } from '@/lib/db/schema';
import { analyzeSingleSession } from '@/lib/session-analysis/analyze';
import type { SessionAnalysisInput } from '@/lib/session-analysis/types';

export async function GET() {
  try {
    // 1. 取最近一个 session
    const latestSessionRows = await db
      .select()
      .from(sessions)
      .orderBy(desc(sessions.createdAt))
      .limit(1);

    if (latestSessionRows.length === 0) {
      return Response.json(
        {
          success: false,
          message: '当前没有可分析的 session',
        },
        { status: 400 }
      );
    }

    const session = latestSessionRows[0];

    // 2. 取这个 session 所属 import 下的消息，并限定时间范围
    const allMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.importId, session.importId))
      .orderBy(asc(messages.sentAt));

    const sessionMessages = allMessages.filter((msg) => {
      const sentAt = new Date(msg.sentAt).getTime();
      return (
        sentAt >= new Date(session.startAt).getTime() &&
        sentAt <= new Date(session.endAt).getTime()
      );
    });

    if (sessionMessages.length === 0) {
      return Response.json(
        {
          success: false,
          message: '当前 session 没有关联到消息。',
          sessionId: session.id,
        },
        { status: 400 }
      );
    }

    // 3. 组装成分析输入
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

    // 4. 调用 Qwen 分析
    const analysis = await analyzeSingleSession(analysisInput);

    return Response.json({
      success: true,
      message: '单个 session 分析成功',
      data: {
        session: {
          id: session.id,
          title: session.title,
          startAt: new Date(session.startAt).toISOString(),
          endAt: new Date(session.endAt).toISOString(),
          messageCount: session.messageCount,
        },
        analysisInputPreview: {
          messageCount: analysisInput.messages.length,
          firstMessages: analysisInput.messages.slice(0, 5),
        },
        analysis,
      },
    });
  } catch (error) {
    console.error('单个 session 分析失败:', error);

    return Response.json(
      {
        success: false,
        message: '单个 session 分析失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}