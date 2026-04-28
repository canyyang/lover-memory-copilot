import { HumanMessage } from '@langchain/core/messages';
import { qwen } from '@/lib/ai/qwen';
import { buildMemoryAnalysisPrompt } from './prompt';
import { safeParseMemoryAnalysis } from './parser';
import type {
  MemoryAnalysisInput,
  MemoryAnalysisResult,
} from './types';

export async function analyzeMemoryCards(
  input: MemoryAnalysisInput
): Promise<MemoryAnalysisResult> {
  const prompt = buildMemoryAnalysisPrompt(input);

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

  return safeParseMemoryAnalysis(content);
}