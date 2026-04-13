import { asc, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { imports, messages, sessions } from '@/lib/db/schema';
import { splitMessagesIntoSessions } from '@/lib/chat/sessionize';
import type { CleanTextMessage } from '@/lib/chat/types';

export async function GET() {
  try {
    // 1. 找最近一次已解析完成的 import
    const latestImport = await db
      .select()
      .from(imports)
      .where(eq(imports.status, 'parsed'))
      .orderBy(desc(imports.createdAt))
      .limit(1);

    if (latestImport.length === 0) {
      return Response.json(
        {
          success: false,
          message: '没有找到可用于切分 session 的导入记录，请先完成导入。',
        },
        { status: 400 }
      );
    }

    const currentImport = latestImport[0];

    // 2. 取出这次导入下的全部 messages
    const importMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.importId, currentImport.id))
      .orderBy(asc(messages.sentAt));

    if (importMessages.length === 0) {
      return Response.json(
        {
          success: false,
          message: '当前导入记录下没有消息数据。',
          importId: currentImport.id,
        },
        { status: 400 }
      );
    }

    // 3. 转成 sessionize 需要的消息结构
    const cleanMessages: CleanTextMessage[] = importMessages.map((msg) => ({
      id: msg.id,
      relationId: msg.relationId,
      importId: msg.importId,
      rawLocalId: null,
      rawPlatformMessageId: msg.rawMessageId,
      direction: msg.role as 'self' | 'partner',
      senderUsername: null,
      senderDisplayName: null,
      content: msg.content,
      sentAt: new Date(msg.sentAt),
      rawPayload: msg.rawPayload as Record<string, unknown>,
    }));

    // 4. 切分 session
    const sessionDrafts = splitMessagesIntoSessions(cleanMessages);

    // 5. 为了避免重复测试先清空当前 import 下已有的 sessions
    await db.delete(sessions).where(eq(sessions.importId, currentImport.id));

    // 6. 写入 sessions 表
    if (sessionDrafts.length > 0) {
      await db.insert(sessions).values(
        sessionDrafts.map((session) => ({
          id: session.id,
          relationId: session.relationId,
          importId: session.importId,
          title: session.title,
          summary: session.summary,
          startAt: session.startAt,
          endAt: session.endAt,
          messageCount: session.messageCount,
        }))
      );
    }

    // 7. 返回结果预览
    return Response.json({
      success: true,
      message: 'session 切分成功',
      data: {
        importId: currentImport.id,
        sourceMessageCount: importMessages.length,
        sessionCount: sessionDrafts.length,
        preview: sessionDrafts.slice(0, 10).map((session) => ({
          id: session.id,
          title: session.title,
          startAt: session.startAt.toISOString(),
          endAt: session.endAt.toISOString(),
          messageCount: session.messageCount,
          firstMessage: session.messages[0]?.content ?? null,
          lastMessage: session.messages[session.messages.length - 1]?.content ?? null,
        })),
      },
    });
  } catch (error) {
    console.error('session 切分失败:', error);

    return Response.json(
      {
        success: false,
        message: 'session 切分失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}