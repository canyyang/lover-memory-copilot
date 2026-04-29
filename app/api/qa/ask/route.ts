import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { qaRecords } from '@/lib/db/schema';
import { buildRelationshipQAContext } from '@/lib/qa/retrieve';
import { answerRelationshipQuestion } from '@/lib/qa/analyze';
import type { AskQuestionRequestBody } from '@/lib/qa/api-types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<AskQuestionRequestBody>;

    const relationId =
      typeof body.relationId === 'string' ? body.relationId.trim() : '';
    const question =
      typeof body.question === 'string' ? body.question.trim() : '';

    if (!relationId) {
      return Response.json(
        {
          success: false,
          message: '缺少 relationId',
        },
        { status: 400 }
      );
    }

    if (!question) {
      return Response.json(
        {
          success: false,
          message: '问题不能为空',
        },
        { status: 400 }
      );
    }

    // 1. 构建问答上下文
    const context = await buildRelationshipQAContext({
      relationId,
      question,
    });

    // 2. 调用关系问答
    const answer = await answerRelationshipQuestion(context);

    // 3. 回答成功后，自动写入 qa_records
    const qaRecordId = randomUUID();

    await db.insert(qaRecords).values({
      id: qaRecordId,
      relationId: answer.relationId,
      question: answer.question,
      answer: answer.answer,
      keyPoints: answer.keyPoints,
      referencedSessionIds: answer.referencedSessionIds,
      referencedMemoryCardIds: answer.referencedMemoryCardIds,
    });

    return Response.json({
      success: true,
      message: '关系问答成功',
      data: {
        ...answer,
        qaRecordId,
      },
    });
  } catch (error) {
    console.error('关系问答接口失败:', error);

    return Response.json(
      {
        success: false,
        message: '关系问答接口失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}