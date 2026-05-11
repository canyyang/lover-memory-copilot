import type { RelationshipQuestionIntent } from './intent';

export type AnswerTemplate = {
  intent: RelationshipQuestionIntent;
  answerGoal: string;
  answerStructure: string[];
  emphasis: string[];
  forbidden: string[];
};

export function getAnswerTemplate(
  intent: RelationshipQuestionIntent
): AnswerTemplate {
  switch (intent) {
    case 'relationship_overview':
      return {
        intent,
        answerGoal: '概括当前关系整体状态、主要卡点和阶段性特征。',
        answerStructure: [
          '先给整体判断',
          '再总结主要卡点',
          '最后指出一两个最关键的关系特征',
        ],
        emphasis: ['整体性', '主要问题', '阶段总结'],
        forbidden: ['不要只谈单个片段', '不要直接给建议替代总结'],
      };

    case 'partner_need':
      return {
        intent,
        answerGoal: '分析对方最近更在意什么、需要什么、希望得到什么回应。',
        answerStructure: [
          '先回答对方当前更在意的核心点',
          '再解释这些在意点背后的原因',
          '最后指出她更希望得到什么样的回应',
        ],
        emphasis: ['对方需求', '在意点', '回应偏好'],
        forbidden: ['不要把重点写成用户的问题总结', '不要泛泛谈关系整体'],
      };

    case 'partner_pattern':
      return {
        intent,
        answerGoal: '分析对方在关系中的稳定模式、情绪模式或应对模式。',
        answerStructure: [
          '先概括对方的模式',
          '再说明这种模式常出现在哪些场景',
          '最后指出这种模式对关系的影响',
        ],
        emphasis: ['行为模式', '情绪模式', '重复出现的规律'],
        forbidden: ['不要只回答她在意什么', '不要直接给行动建议为主'],
      };

    case 'user_pattern':
      return {
        intent,
        answerGoal: '分析用户在关系中的高风险模式、容易导致紧张的行为方式。',
        answerStructure: [
          '先指出最明显的用户模式',
          '再说明这种模式通常出现在什么场景',
          '最后指出它为什么容易让关系变紧张',
        ],
        emphasis: ['用户模式', '高风险行为', '关系影响'],
        forbidden: ['不要把重点写成对方的问题', '不要只做泛泛安慰'],
      };

    case 'positive_signal':
      return {
        intent,
        answerGoal: '识别关系里的积极互动、回暖信号和正向变化。',
        answerStructure: [
          '先指出最明显的积极信号',
          '再说明这些信号为什么重要',
          '最后概括当前有哪些正向趋势',
        ],
        emphasis: ['积极互动', '回暖信号', '关系改善'],
        forbidden: ['不要被风险问题带偏', '不要只总结矛盾'],
      };

    case 'risk_issue':
      return {
        intent,
        answerGoal: '识别长期风险、未闭环议题和最需要注意的问题。',
        answerStructure: [
          '先指出最需要注意的核心风险',
          '再说明它为什么反复出现',
          '最后指出这个问题如果不处理会带来的关系影响',
        ],
        emphasis: ['长期风险', '未闭环议题', '持续性问题'],
        forbidden: ['不要只谈短期情绪波动', '不要过度乐观淡化问题'],
      };

    case 'repair_suggestion':
      return {
        intent,
        answerGoal: '给出更贴合当前关系状态的沟通或修复建议。',
        answerStructure: [
          '先概括当前最适合的应对方向',
          '再给出两到三个可执行建议',
          '最后提醒哪些做法应避免',
        ],
        emphasis: ['可执行建议', '沟通方式', '避免踩雷'],
        forbidden: ['不要只做总结不回答怎么做', '不要给过于空泛的建议'],
      };

    case 'unknown':
    default:
      return {
        intent: 'unknown',
        answerGoal: '尽量基于现有关系知识给出稳妥回答。',
        answerStructure: [
          '先回答用户问题',
          '再给出关键依据',
          '最后说明不确定处',
        ],
        emphasis: ['稳妥', '基于证据', '不过度推断'],
        forbidden: ['不要编造', '不要过度自信'],
      };
  }
}