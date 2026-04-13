import { randomUUID } from 'crypto';
import { SESSION_GAP_MINUTES } from './constants';
import type { CleanTextMessage, SessionDraft } from './types';

function getGapMs(minutes: number): number {
  return minutes * 60 * 1000;
}

function buildSessionTitle(messages: CleanTextMessage[]): string | null {
  if (messages.length === 0) {
    return null;
  }

  const first = messages[0];
  const preview = first.content.slice(0, 10);

  if (!preview) {
    return '未命名聊天阶段';
  }

  return `围绕“${preview}”的聊天`;
}

export function splitMessagesIntoSessions(messages: CleanTextMessage[]): SessionDraft[] {
  if (messages.length === 0) {
    return [];
  }

  const sortedMessages = [...messages].sort(
    (a, b) => a.sentAt.getTime() - b.sentAt.getTime()
  );

  const gapMs = getGapMs(SESSION_GAP_MINUTES);
  const sessions: SessionDraft[] = [];

  let currentBucket: CleanTextMessage[] = [sortedMessages[0]];

  for (let i = 1; i < sortedMessages.length; i++) {
    const prev = sortedMessages[i - 1];
    const current = sortedMessages[i];

    const diff = current.sentAt.getTime() - prev.sentAt.getTime();

    if (diff > gapMs) {
      sessions.push(buildSessionDraft(currentBucket));
      currentBucket = [current];
    } else {
      currentBucket.push(current);
    }
  }

  if (currentBucket.length > 0) {
    sessions.push(buildSessionDraft(currentBucket));
  }

  return sessions;
}

function buildSessionDraft(messages: CleanTextMessage[]): SessionDraft {
  const first = messages[0];
  const last = messages[messages.length - 1];

  return {
    id: randomUUID(),
    relationId: first.relationId,
    importId: first.importId,
    title: buildSessionTitle(messages),
    summary: null,
    startAt: first.sentAt,
    endAt: last.sentAt,
    messageCount: messages.length,
    messages,
  };
}