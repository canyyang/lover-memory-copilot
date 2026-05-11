import { HumanMessage } from '@langchain/core/messages';
import { qwen } from '@/lib/ai/qwen';

type SessionSummary = {
  title: string | null;
  summary: string | null;
  moodLabel: string | null;
  signalLabel: string | null;
};

type MemoryCardSummary = {
  memoryType: string;
  title: string;
  content: string;
  confidence: string;
  status: string;
};

export async function generateAiOverview(params: {
  keySessions: SessionSummary[];
  memoryCards: MemoryCardSummary[];
  totalSessions: number;
  totalMessages: number;
}) {
  const { keySessions, memoryCards, totalSessions, totalMessages } = params;

  const prompt = `
你是一名情侣关系分析助手。
根据以下信息生成一段简洁自然的关系总览摘要，适合展示在复盘页面顶部：

- 总聊天阶段数：${totalSessions}
- 总消息数：${totalMessages}
- 关键阶段数：${keySessions.length}
- 关键阶段摘要：
${keySessions.map((s, i) => `${i + 1}. ${s.summary ?? '无摘要'}`).join('\n')}

- 长期关系记忆：
${memoryCards.map((m, i) => `${i + 1}. [${m.memoryType}] ${m.title}：${m.content}`).join('\n')}

要求：
1. 只输出纯文本
2. 不要输出 markdown
3. 控制在 100~150 字
4. 语言自然，适合直接展示给用户
5. 尽量同时覆盖：整体状态、关键问题、积极信号或长期模式
`.trim();

  const response = await qwen.invoke([new HumanMessage(prompt)]);

  const content =
    typeof response.content === 'string'
      ? response.content
      : Array.isArray(response.content)
      ? response.content
          .map((item) =>
            typeof item === 'string'
              ? item
              : 'text' in item && typeof item.text === 'string'
              ? item.text
              : ''
          )
          .join('\n')
      : '';

  return content.trim() || '当前无法生成总览摘要';
}