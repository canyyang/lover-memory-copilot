import { z } from 'zod';

export const moodLabelSchema = z.enum([
  '轻松',
  '暧昧',
  '不安',
  '安抚',
  '试探',
  '日常',
  '认真',
  '低落',
]);

export const signalLabelSchema = z.enum([
  '普通互动',
  '互相关心',
  '关系升温',
  '情绪波动',
  '试探承诺',
  '需要关注',
]);

export const sessionAnalysisResultSchema = z.object({
  summary: z.string().min(1).max(200),
  topicTags: z.array(z.string().min(1)).max(3),
  moodLabel: moodLabelSchema,
  signalLabel: signalLabelSchema,
  isKeySession: z.boolean(),
});

export type SessionAnalysisResultSchema = z.infer<
  typeof sessionAnalysisResultSchema
>;