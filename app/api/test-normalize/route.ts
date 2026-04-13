import { readFile } from 'fs/promises';
import path from 'path';
import { normalizeTextMessages } from '@/lib/chat/normalize';
import type { RawChatJson } from '@/lib/chat/types';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'example.json');
    const fileContent = await readFile(filePath, 'utf-8');
    const payload = JSON.parse(fileContent) as RawChatJson;

    const relationId = 'test-relation-id';
    const importId = 'test-import-id';

    const normalizedMessages = normalizeTextMessages({
      payload,
      relationId,
      importId,
    });

    const rawMessageCount = Array.isArray(payload.messages) ? payload.messages.length : 0;

    return Response.json({
      success: true,
      message: '文本消息清洗测试成功',
      data: {
        rawMessageCount,
        normalizedMessageCount: normalizedMessages.length,
        preview: normalizedMessages.slice(0, 10).map((msg) => ({
          id: msg.id,
          direction: msg.direction,
          content: msg.content,
          sentAt: msg.sentAt.toISOString(),
          senderDisplayName: msg.senderDisplayName,
          rawLocalId: msg.rawLocalId,
          rawPlatformMessageId: msg.rawPlatformMessageId,
        })),
      },
    });
  } catch (error) {
    console.error('测试清洗失败:', error);

    return Response.json(
      {
        success: false,
        message: '测试清洗失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}