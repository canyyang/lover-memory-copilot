import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { imports } from '@/lib/db/schema';
import { buildRelationshipQAContext } from '@/lib/qa/retrieve';

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
          message: '没有找到可用于问答检索的导入记录。',
        },
        { status: 400 }
      );
    }

    const currentImport = latestImportRows[0];

    // 2. 构造一个测试问题
    const question = '我们最近主要卡在哪些问题上？';

    // 3. 组装问答上下文
    const context = await buildRelationshipQAContext({
      relationId: currentImport.relationId,
      question,
    });

    return Response.json({
      success: true,
      message: '关系问答上下文构建成功',
      data: {
        relationId: context.relationId,
        question: context.question,
        sessionCount: context.sessions.length,
        memoryCount: context.memories.length,
        sessions: context.sessions,
        memories: context.memories,
      },
    });
  } catch (error) {
    console.error('关系问答上下文构建失败:', error);

    return Response.json(
      {
        success: false,
        message: '关系问答上下文构建失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}