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

    const context = await buildRelationshipQAContext({
      relationId,
      question,
    });

    const answer = await answerRelationshipQuestion(context);

    return Response.json({
      success: true,
      message: '关系问答成功',
      data: answer,
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