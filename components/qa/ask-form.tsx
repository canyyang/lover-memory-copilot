'use client';

import { useState } from 'react';
import { AnswerCard } from './answer-card';

type AskFormProps = {
  relationId: string;
};

type QAAnswerData = {
  relationId: string;
  question: string;
  answer: string;
  keyPoints: string[];
  referencedSessionIds: string[];
  referencedMemoryCardIds: string[];
};

export function AskForm({ relationId }: AskFormProps) {
  const [question, setQuestion] = useState('我们最近主要卡在哪些问题上？');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<QAAnswerData | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setError('请输入问题');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/qa/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          relationId,
          question: trimmedQuestion,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || '问答请求失败');
      }

      setResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-2xl border p-5 space-y-4">
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-700">
            输入你的问题
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            className="mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
            placeholder="例如：我们最近主要卡在哪些问题上？"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? '正在分析...' : '开始提问'}
          </button>

          <span className="text-xs text-gray-500">当前 relationId：{relationId}</span>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </form>

      {result ? <AnswerCard data={result} /> : null}
    </div>
  );
}