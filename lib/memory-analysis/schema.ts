import { z } from 'zod';

export const memoryCardTypeSchema = z.enum([
  'partner_pattern',
  'user_pattern',
  'interaction_pattern',
  'unresolved_issue',
  'positive_signal',
]);

export const memoryConfidenceSchema = z.enum(['high', 'medium', 'low']);

export const memoryCardDraftSchema = z.object({
  memoryType: memoryCardTypeSchema,
  title: z.string().min(1).max(60),
  content: z.string().min(1).max(200),
  evidenceSessionIds: z.array(z.string().min(1)).min(1).max(5),
  confidence: memoryConfidenceSchema,
});

export const memoryAnalysisResultSchema = z.object({
  memoryCards: z.array(memoryCardDraftSchema).max(5),
});

export type MemoryAnalysisResultSchema = z.infer<
  typeof memoryAnalysisResultSchema
>;