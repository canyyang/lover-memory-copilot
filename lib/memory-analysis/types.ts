export type MemoryCardType =
  | 'partner_pattern'
  | 'user_pattern'
  | 'interaction_pattern'
  | 'unresolved_issue'
  | 'positive_signal';

export type MemoryConfidence = 'high' | 'medium' | 'low';

export type MemoryStatus = 'active' | 'hidden';

export type SessionMemoryEvidence = {
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

export type MemoryAnalysisInput = {
  relationId: string;
  evidenceSessions: SessionMemoryEvidence[];
};

export type MemoryCardDraft = {
  memoryType: MemoryCardType;
  title: string;
  content: string;
  evidenceSessionIds: string[];
  confidence: MemoryConfidence;
};

export type MemoryAnalysisResult = {
  memoryCards: MemoryCardDraft[];
};