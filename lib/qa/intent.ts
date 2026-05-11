export type RelationshipQuestionIntent =
  | 'relationship_overview'
  | 'partner_need'
  | 'partner_pattern'
  | 'user_pattern'
  | 'positive_signal'
  | 'risk_issue'
  | 'repair_suggestion'
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

  // 1. 修复建议 / 应对建议
  if (
    q.includes('怎么办') ||
    q.includes('怎么做') ||
    q.includes('怎么聊') ||
    q.includes('怎么说') ||
    q.includes('如何缓和') ||
    q.includes('如何处理') ||
    q.includes('我该怎么')
  ) {
    return 'repair_suggestion';
  }

  // 2. 对方需求 / 在意点
  if (
    q.includes('她更在意') ||
    q.includes('她在意') ||
    q.includes('她需要什么') ||
    q.includes('她想要什么') ||
    q.includes('她更看重') ||
    q.includes('对方更在意') ||
    q.includes('对方需要什么')
  ) {
    return 'partner_need';
  }

  // 3. 对方模式
  if (
    q.includes('她容易') ||
    q.includes('她会不会') ||
    q.includes('她是不是') ||
    q.includes('她的模式') ||
    q.includes('对方模式') ||
    q.includes('她为什么会')
  ) {
    return 'partner_pattern';
  }

  // 4. 自己的模式
  if (
    q.includes('我在哪些') ||
    q.includes('我最容易') ||
    q.includes('我最常') ||
    q.includes('我的问题') ||
    q.includes('我是不是') ||
    q.includes('我会不会') ||
    q.includes('我的模式')
  ) {
    return 'user_pattern';
  }

  // 5. 积极信号 / 回暖信号
  if (
    q.includes('回暖') ||
    q.includes('积极信号') ||
    q.includes('变好') ||
    q.includes('升温') ||
    q.includes('哪些互动算') ||
    q.includes('哪些互动能算') ||
    q.includes('回到以前')
  ) {
    return 'positive_signal';
  }

  // 6. 风险问题 / 长期注意点
  if (
    q.includes('需要注意') ||
    q.includes('风险') ||
    q.includes('长期注意') ||
    q.includes('最需要注意') ||
    q.includes('隐患') ||
    q.includes('最大的问题') ||
    q.includes('最危险')
  ) {
    return 'risk_issue';
  }

  // 7. 关系总览
  if (
    q.includes('最近主要卡') ||
    q.includes('主要卡在哪') ||
    q.includes('整体') ||
    q.includes('最近怎么样') ||
    q.includes('关系状态') ||
    q.includes('这段关系') ||
    q.includes('最近的问题')
  ) {
    return 'relationship_overview';
  }

  return 'unknown';
}