import { relationshipAnswerSchema } from './schema';

function stripMarkdownCodeFence(text: string): string {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function extractFirstJsonObject(text: string): string {
  const cleaned = stripMarkdownCodeFence(text);

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('模型返回内容中没有找到有效 JSON 对象');
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
}

export function safeParseRelationshipAnswer(rawText: string) {
  const jsonText = extractFirstJsonObject(rawText);

  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('模型返回的 JSON 解析失败');
  }

  const result = relationshipAnswerSchema.safeParse(parsed);

  if (!result.success) {
    throw new Error(
      `模型返回结构不合法: ${result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ')}`
    );
  }

  return result.data;
}