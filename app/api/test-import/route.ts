import { randomUUID } from 'crypto';
import { readFile } from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { imports, messages, relations, users } from '@/lib/db/schema';
import { normalizeTextMessages } from '@/lib/chat/normalize';
import type { RawChatJson } from '@/lib/chat/types';

export async function GET() {
  try {
    // 1. 读取本地示例 JSON
    const filePath = path.join(process.cwd(), 'data', 'example.json');
    const fileContent = await readFile(filePath, 'utf-8');
    const payload = JSON.parse(fileContent) as RawChatJson;

    // 2. 准备一组测试 user / relation / import id
    const userId = randomUUID();
    const relationId = randomUUID();
    const importId = randomUUID();

    // 3. 先创建一个测试用户和测试关系
    await db.insert(users).values({
      id: userId,
      name: `导入测试用户-${Date.now()}`,
    });

    await db.insert(relations).values({
      id: relationId,
      title: `导入测试关系-${Date.now()}`,
      ownerId: userId,
    });

    // 4. 先写一条 imports 记录，状态设为 uploaded
    await db.insert(imports).values({
      id: importId,
      relationId,
      fileName: 'example.json',
      sourceType: 'wechat_json',
      status: 'uploaded',
      rawFilePath: filePath,
      messageCount: 0,
    });

    // 5. 清洗文本消息
    const normalizedMessages = normalizeTextMessages({
      payload,
      relationId,
      importId,
    });

    // 6. 批量写入 messages
    if (normalizedMessages.length > 0) {
      await db.insert(messages).values(
        normalizedMessages.map((msg) => ({
          id: msg.id,
          relationId: msg.relationId,
          importId: msg.importId,
          role: msg.direction,
          content: msg.content,
          sentAt: msg.sentAt,
          rawMessageId: msg.rawPlatformMessageId,
          rawPayload: msg.rawPayload,
        }))
      );
    }

    // 7. 更新 imports 状态和消息数量
    await db
      .update(imports)
      .set({
        status: 'parsed',
        messageCount: normalizedMessages.length,
      })
      .where(eq(imports.id, importId));

    // 8. 返回结果
    return Response.json({
      success: true,
      message: '测试导入成功',
      data: {
        userId,
        relationId,
        importId,
        rawMessageCount: Array.isArray(payload.messages) ? payload.messages.length : 0,
        normalizedMessageCount: normalizedMessages.length,
        preview: normalizedMessages.slice(0, 5).map((msg) => ({
          id: msg.id,
          direction: msg.direction,
          content: msg.content,
          sentAt: msg.sentAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('测试导入失败:', error);

    return Response.json(
      {
        success: false,
        message: '测试导入失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}