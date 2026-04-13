export type SessionMessageForAnalysis = {
    role: 'self' | 'partner';
    content: string;
    sentAt: string;
  };
  
  export type SessionAnalysisInput = {
    sessionId: string;
    relationId: string;
    importId: string;
    title: string | null;
    startAt: string;
    endAt: string;
    messageCount: number;
    messages: SessionMessageForAnalysis[];
  };
  
  export type MoodLabel =
    | '轻松'
    | '暧昧'
    | '不安'
    | '安抚'
    | '试探'
    | '日常'
    | '认真'
    | '低落';
  
  export type SignalLabel =
    | '普通互动'
    | '互相关心'
    | '关系升温'
    | '情绪波动'
    | '试探承诺'
    | '需要关注';
  
  export type SessionAnalysisResult = {
    summary: string;
    topicTags: string[];
    moodLabel: MoodLabel;
    signalLabel: SignalLabel;
    isKeySession: boolean;
  };
  
  export type SessionAnalysisRecord = SessionAnalysisResult & {
    sessionId: string;
  };