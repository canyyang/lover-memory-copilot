import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { memoryCards } from '@/lib/db/schema';
import type { ToggleMemoryStatusRequestBody } from '@/lib/memory-analysis/api-types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ToggleMemoryStatusRequestBody>;

    const memoryCardId =
      typeof body.memoryCardId === 'string' ? body.memoryCardId.trim() : '';

    const status =
      body.status === 'active' || body.status === 'hidden'
        ? body.status
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

    if (!status) {
      return Response.json(
        {
          success: false,
          message: 'status 只能是 active 或 hidden',
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
        status,
        updatedAt: new Date(),
      })
      .where(eq(memoryCards.id, memoryCardId));

    return Response.json({
      success: true,
      message: '记忆卡片状态更新成功',
      data: {
        memoryCardId,
        status,
      },
    });
  } catch (error) {
    console.error('记忆卡片状态更新失败:', error);

    return Response.json(
      {
        success: false,
        message: '记忆卡片状态更新失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}