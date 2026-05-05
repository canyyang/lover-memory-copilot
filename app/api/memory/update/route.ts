import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { memoryCards } from '@/lib/db/schema';
import type { UpdateMemoryCardRequestBody } from '@/lib/memory-analysis/api-types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<UpdateMemoryCardRequestBody>;

    const memoryCardId =
      typeof body.memoryCardId === 'string' ? body.memoryCardId.trim() : '';

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    const confidence =
      body.confidence === 'high' ||
      body.confidence === 'medium' ||
      body.confidence === 'low'
        ? body.confidence
        : null;

    if (!memoryCardId) {
      return Response.json(
        {
          success: false,
          message: '缺少 memoryCardId',
        },
        { status: 400 }
      );
    }

    if (!title) {
      return Response.json(
        {
          success: false,
          message: 'title 不能为空',
        },
        { status: 400 }
      );
    }

    if (!content) {
      return Response.json(
        {
          success: false,
          message: 'content 不能为空',
        },
        { status: 400 }
      );
    }

    if (!confidence) {
      return Response.json(
        {
          success: false,
          message: 'confidence 只能是 high / medium / low',
        },
        { status: 400 }
      );
    }

    const existingRows = await db
      .select()
      .from(memoryCards)
      .where(eq(memoryCards.id, memoryCardId))
      .limit(1);

    if (existingRows.length === 0) {
      return Response.json(
        {
          success: false,
          message: '没有找到对应的 memory card',
        },
        { status: 404 }
      );
    }

    await db
      .update(memoryCards)
      .set({
        title,
        content,
        confidence,
        updatedAt: new Date(),
      })
      .where(eq(memoryCards.id, memoryCardId));

    return Response.json({
      success: true,
      message: '记忆卡片更新成功',
      data: {
        memoryCardId,
        title,
        content,
        confidence,
      },
    });
  } catch (error) {
    console.error('记忆卡片更新失败:', error);

    return Response.json(
      {
        success: false,
        message: '记忆卡片更新失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}