import { HumanMessage } from '@langchain/core/messages';
import { qwen } from '@/lib/ai/qwen';
import { buildRelationshipQAPrompt } from './prompt';
import { safeParseRelationshipAnswer } from './parser';
import type {
  RelationshipAnswerRecord,
  RelationshipQuestionInput,
} from './types';

function collectValidIds(input: RelationshipQuestionInput) {
  const validSessionIds = new Set(input.sessions.map((item) => item.sessionId));
  const validMemoryCardIds = new Set(
    input.memories.map((item) => item.memoryCardId)
  );

  return { validSessionIds, validMemoryCardIds };
}

export async function answerRelationshipQuestion(
  input: RelationshipQuestionInput
): Promise<RelationshipAnswerRecord> {
  const prompt = buildRelationshipQAPrompt(input);

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

  const parsed = safeParseRelationshipAnswer(content);

  const { validSessionIds, validMemoryCardIds } = collectValidIds(input);

  return {
    relationId: input.relationId,
    question: input.question,
    answer: parsed.answer,
    keyPoints: parsed.keyPoints,
    referencedSessionIds: parsed.referencedSessionIds.filter((id) =>
      validSessionIds.has(id)
    ),
    referencedMemoryCardIds: parsed.referencedMemoryCardIds.filter((id) =>
      validMemoryCardIds.has(id)
    ),
  };
}