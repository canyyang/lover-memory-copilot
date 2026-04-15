import { HumanMessage } from '@langchain/core/messages';
import { qwen } from '@/lib/ai/qwen';
import { buildSessionAnalysisPrompt } from './prompt';
import { safeParseSessionAnalysis } from './parser';
import type {
  SessionAnalysisInput,
  SessionAnalysisRecord,
} from './types';

export async function analyzeSingleSession(
  input: SessionAnalysisInput
): Promise<SessionAnalysisRecord> {
  const prompt = buildSessionAnalysisPrompt(input);

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

  if (!content.trim()) {
    throw new Error('模型返回内容为空');
  }

  const parsed = safeParseSessionAnalysis(content);

  return {
    sessionId: input.sessionId,
    ...parsed,
  };
}