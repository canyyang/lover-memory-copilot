import { z } from 'zod';

export const relationshipAnswerSchema = z.object({
  answer: z.string().min(1).max(300),
  keyPoints: z.array(z.string().min(1)).min(2).max(4),
  referencedSessionIds: z.array(z.string().min(1)).max(8),
  referencedMemoryCardIds: z.array(z.string().min(1)).max(6),
});

export type RelationshipAnswerSchema = z.infer<
  typeof relationshipAnswerSchema
>;