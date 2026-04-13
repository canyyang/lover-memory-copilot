export type RawMessage = {
    localId?: number;
    createTime?: number;
    formattedTime?: string;
    type?: string;
    localType?: number;
    content?: string;
    isSend: number;
    senderUsername?: string;
    senderDisplayName?: string;
    source?: string;
    senderAvatarKey?: string;
    platformMessageId?: string;
  
    [key: string]: unknown;
  };
  
  export type RawChatJson = {
    messages?: RawMessage[];
    weflow?: unknown;
    session?: unknown;
  };
  
  export type MessageDirection = 'self' | 'partner';
  
  export type CleanTextMessage = {
    id: string;
    relationId: string;
    importId: string;
  
    rawLocalId: number | null;
    rawPlatformMessageId: string | null;
  
    direction: MessageDirection;
    senderUsername: string | null;
    senderDisplayName: string | null;
  
    content: string;
    sentAt: Date;
  
    rawPayload: Record<string, unknown>;
  };

  export type SessionDraft = {
    id: string;
    relationId: string;
    importId: string;
    title: string | null;
    summary: string | null;
    startAt: Date;
    endAt: Date;
    messageCount: number;
    messages: CleanTextMessage[];
  };