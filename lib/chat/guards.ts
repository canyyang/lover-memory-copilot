import { TEXT_MESSAGE_LOCAL_TYPE, TEXT_MESSAGE_TYPE } from './constants';
import type { RawMessage } from './types';

export function isRawTextMessage(message: RawMessage): boolean {
  return (
    message.type === TEXT_MESSAGE_TYPE &&
    message.localType === TEXT_MESSAGE_LOCAL_TYPE
  );
}

export function hasValidTextContent(
  message: RawMessage,
): message is RawMessage & { content: string } {
  if (typeof message.content !== 'string') {
    return false;
  }

  return message.content.trim().length > 0;
}

export function hasValidCreateTime(
  message: RawMessage,
): message is RawMessage & { createTime: number } {
  return typeof message.createTime === 'number' && Number.isFinite(message.createTime);
}

export function hasValidIsSend(message: RawMessage): boolean {
  return message.isSend === 0 || message.isSend === 1;
}