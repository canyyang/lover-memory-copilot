export type RelationshipQuestionIntent =
  | 'relationship_overview'
  | 'partner_pattern'
  | 'user_pattern'
  | 'positive_signal'
  | 'risk_issue'
  | 'unknown';

export type RetrievalStrategyInfo = {
  intent: RelationshipQuestionIntent;
  preferredMemoryTypes: string[];
  preferredSignalLabels: string[];
  preferredMoodLabels: string[];
  maxSessionEvidence: number;
  maxMemoryEvidence: number;
};

export type RetrievedSessionEvidence = {
  sessionId: string;
  title: string | null;
  summary: string | null;
  topicTags: string[];
  moodLabel: string | null;
  signalLabel: string | null;
  isKeySession: boolean;
  startAt: string;
  endAt: string;
  messageCount: number;
};

export type RetrievedMemoryEvidence = {
  memoryCardId: string;
  memoryType: string;
  title: string;
  content: string;
  confidence: string;
  evidenceSessionIds: string[];
};

export type RelationshipQuestionInput = {
  relationId: string;
  question: string;
  intent: RelationshipQuestionIntent;
  strategy: RetrievalStrategyInfo;
  sessions: RetrievedSessionEvidence[];
  memories: RetrievedMemoryEvidence[];
};

export type RelationshipAnswer = {
  answer: string;
  keyPoints: string[];
  referencedSessionIds: string[];
  referencedMemoryCardIds: string[];
};

export type RelationshipAnswerRecord = RelationshipAnswer & {
  relationId: string;
  question: string;
};