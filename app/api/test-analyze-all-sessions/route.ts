import { analyzeLatestImportSessions } from '@/lib/session-analysis/batch';

export async function GET() {
  try {
    const result = await analyzeLatestImportSessions();

    return Response.json({
      success: true,
      message: '批量 session 分析完成',
      data: result,
    });
  } catch (error) {
    console.error('批量 session 分析失败:', error);

    return Response.json(
      {
        success: false,
        message: '批量 session 分析失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}