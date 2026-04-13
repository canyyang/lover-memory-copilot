import { randomUUID } from 'crypto';
import {
  hasValidCreateTime,
  hasValidIsSend,
  hasValidTextContent,
  isRawTextMessage,
} from './guards';
import type { CleanTextMessage, MessageDirection, RawChatJson, RawMessage } from './types';

function mapDirection(isSend: number): MessageDirection {
  return isSend === 1 ? 'self' : 'partner';
}

function normalizeContent(content: string): string {
  return content.trim();
}

function toDateFromUnixSeconds(createTime: number): Date {
  return new Date(createTime * 1000);
}

export function extractRawMessages(payload: RawChatJson): RawMessage[] {
  if (!payload || !Array.isArray(payload.messages)) {
    return [];
  }

  return payload.messages;
}

export function normalizeSingleTextMessage(params: {
  rawMessage: RawMessage;
  relationId: string;
  importId: string;
}): CleanTextMessage | null {
  const { rawMessage, relationId, importId } = params;

  if (!isRawTextMessage(rawMessage)) {
    return null;
  }

  if (!hasValidTextContent(rawMessage)) {
    return null;
  }

  if (!hasValidCreateTime(rawMessage)) {
    return null;
  }

  if (!hasValidIsSend(rawMessage)) {
    return null;
  }

  return {
    id: randomUUID(),
    relationId,
    importId,

    rawLocalId: typeof rawMessage.localId === 'number' ? rawMessage.localId : null,
    rawPlatformMessageId:
      typeof rawMessage.platformMessageId === 'string'
        ? rawMessage.platformMessageId
        : null,

    direction: mapDirection(rawMessage.isSend),
    senderUsername:
      typeof rawMessage.senderUsername === 'string' ? rawMessage.senderUsername : null,
    senderDisplayName:
      typeof rawMessage.senderDisplayName === 'string'
        ? rawMessage.senderDisplayName
        : null,

    content: normalizeContent(rawMessage.content),
    sentAt: toDateFromUnixSeconds(rawMessage.createTime),

    rawPayload: rawMessage as Record<string, unknown>,
  };
}

export function normalizeTextMessages(params: {
  payload: RawChatJson;
  relationId: string;
  importId: string;
}): CleanTextMessage[] {
  const { payload, relationId, importId } = params;

  const rawMessages = extractRawMessages(payload);
  const result: CleanTextMessage[] = [];

  for (const rawMessage of rawMessages) {
    const normalized = normalizeSingleTextMessage({
      rawMessage,
      relationId,
      importId,
    });

    if (normalized) {
      result.push(normalized);
    }
  }

  result.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());

  return result;
}