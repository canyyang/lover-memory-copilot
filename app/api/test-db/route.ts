import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { relations, users } from '@/lib/db/schema';

export async function GET() {
  try {
    const userId = randomUUID();
    const relationId = randomUUID();

    const newUser = {
      id: userId,
      name: `测试用户-${Date.now()}`,
    };

    const newRelation = {
      id: relationId,
      title: `测试关系-${Date.now()}`,
      ownerId: userId,
    };

    await db.insert(users).values(newUser);
    await db.insert(relations).values(newRelation);

    return Response.json({
      success: true,
      message: '测试数据写入成功',
      data: {
        user: newUser,
        relation: newRelation,
      },
    });
  } catch (error) {
    console.error('写入数据库失败:', error);

    return Response.json(
      {
        success: false,
        message: '写入数据库失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}