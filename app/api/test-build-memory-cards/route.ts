import { buildLatestRelationMemoryCards } from '@/lib/memory-analysis/batch';

export async function GET() {
  try {
    const result = await buildLatestRelationMemoryCards();

    return Response.json({
      success: true,
      message: '长期关系记忆卡片构建成功',
      data: result,
    });
  } catch (error) {
    console.error('长期关系记忆卡片构建失败:', error);

    return Response.json(
      {
        success: false,
        message: '长期关系记忆卡片构建失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}