import type { RelationshipQuestionIntent } from './intent';

export type RetrievalStrategy = {
  intent: RelationshipQuestionIntent;
  preferredMemoryTypes: string[];
  preferredSignalLabels: string[];
  preferredMoodLabels: string[];
  maxSessionEvidence: number;
  maxMemoryEvidence: number;
};

export function getRetrievalStrategy(
  intent: RelationshipQuestionIntent
): RetrievalStrategy {
  switch (intent) {
    case 'partner_pattern':
      return {
        intent,
        preferredMemoryTypes: ['partner_pattern', 'interaction_pattern'],
        preferredSignalLabels: ['试探承诺', '情绪波动', '互相关心'],
        preferredMoodLabels: ['不安', '试探', '安抚', '认真'],
        maxSessionEvidence: 6,
        maxMemoryEvidence: 5,
      };

    case 'user_pattern':
      return {
        intent,
        preferredMemoryTypes: ['user_pattern', 'interaction_pattern'],
        preferredSignalLabels: ['情绪波动', '需要关注', '试探承诺'],
        preferredMoodLabels: ['不安', '认真', '试探'],
        maxSessionEvidence: 6,
        maxMemoryEvidence: 5,
      };

    case 'positive_signal':
      return {
        intent,
        preferredMemoryTypes: ['positive_signal', 'interaction_pattern'],
        preferredSignalLabels: ['关系升温', '互相关心', '普通互动'],
        preferredMoodLabels: ['轻松', '暧昧', '安抚', '日常'],
        maxSessionEvidence: 6,
        maxMemoryEvidence: 5,
      };

    case 'risk_issue':
      return {
        intent,
        preferredMemoryTypes: ['unresolved_issue', 'partner_pattern', 'user_pattern'],
        preferredSignalLabels: ['需要关注', '情绪波动', '试探承诺'],
        preferredMoodLabels: ['不安', '低落', '认真', '试探'],
        maxSessionEvidence: 8,
        maxMemoryEvidence: 6,
      };

    case 'relationship_overview':
      return {
        intent,
        preferredMemoryTypes: [
          'partner_pattern',
          'user_pattern',
          'interaction_pattern',
          'unresolved_issue',
          'positive_signal',
        ],
        preferredSignalLabels: [
          '普通互动',
          '互相关心',
          '关系升温',
          '情绪波动',
          '试探承诺',
          '需要关注',
        ],
        preferredMoodLabels: ['轻松', '暧昧', '不安', '安抚', '试探', '日常', '认真', '低落'],
        maxSessionEvidence: 8,
        maxMemoryEvidence: 6,
      };

    case 'unknown':
    default:
      return {
        intent: 'unknown',
        preferredMemoryTypes: [
          'partner_pattern',
          'user_pattern',
          'interaction_pattern',
          'unresolved_issue',
          'positive_signal',
        ],
        preferredSignalLabels: [
          '普通互动',
          '互相关心',
          '关系升温',
          '情绪波动',
          '试探承诺',
          '需要关注',
        ],
        preferredMoodLabels: ['轻松', '暧昧', '不安', '安抚', '试探', '日常', '认真', '低落'],
        maxSessionEvidence: 8,
        maxMemoryEvidence: 6,
      };
  }
}