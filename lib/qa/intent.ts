export type RelationshipQuestionIntent =
  | 'relationship_overview'
  | 'partner_pattern'
  | 'user_pattern'
  | 'positive_signal'
  | 'risk_issue'
  | 'unknown';

function normalizeQuestion(question: string): string {
  return question.trim().toLowerCase();
}

export function classifyRelationshipQuestionIntent(
  question: string
): RelationshipQuestionIntent {
  const q = normalizeQuestion(question);

  if (!q) {
    return 'unknown';
  }

  // 1. 对方模式
  if (
    q.includes('她') ||
    q.includes('对方') ||
    q.includes('她最近更在意') ||
    q.includes('她更在意') ||
    q.includes('她在意') ||
    q.includes('她容易') ||
    q.includes('她会不会') ||
    q.includes('她是不是')
  ) {
    return 'partner_pattern';
  }

  // 2. 自己的模式
  if (
    q.includes('我在哪些') ||
    q.includes('我最容易') ||
    q.includes('我最常') ||
    q.includes('我的问题') ||
    q.includes('我是不是') ||
    q.includes('我会不会')
  ) {
    return 'user_pattern';
  }

  // 3. 积极信号 / 回暖信号
  if (
    q.includes('回暖') ||
    q.includes('积极信号') ||
    q.includes('变好') ||
    q.includes('升温') ||
    q.includes('哪些互动算') ||
    q.includes('哪些互动能算')
  ) {
    return 'positive_signal';
  }

  // 4. 风险问题 / 长期注意点
  if (
    q.includes('需要注意') ||
    q.includes('风险') ||
    q.includes('长期注意') ||
    q.includes('最需要注意') ||
    q.includes('问题是什么') ||
    q.includes('隐患')
  ) {
    return 'risk_issue';
  }

  // 5. 关系总览
  if (
    q.includes('最近主要卡') ||
    q.includes('主要卡在哪') ||
    q.includes('整体') ||
    q.includes('最近怎么样') ||
    q.includes('关系状态') ||
    q.includes('这段关系')
  ) {
    return 'relationship_overview';
  }

  return 'unknown';
}