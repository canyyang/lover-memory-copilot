import { HumanMessage } from '@langchain/core/messages';
import { qwen } from '@/lib/ai/qwen';

export async function GET() {
  try {
    const response = await qwen.invoke([
      new HumanMessage('请只回复这句话：Qwen 模型连接成功'),
    ]);

    return Response.json({
      success: true,
      message: 'Qwen 调用成功',
      data: {
        content: response.content,
      },
    });
  } catch (error) {
    console.error('Qwen 调用失败:', error);

    return Response.json(
      {
        success: false,
        message: 'Qwen 调用失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}