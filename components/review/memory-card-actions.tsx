'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type MemoryCardActionsProps = {
  memoryCardId: string;
  status: 'active' | 'hidden';
};

export function MemoryCardActions({
  memoryCardId,
  status,
}: MemoryCardActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const nextStatus = status === 'active' ? 'hidden' : 'active';
  const buttonText = status === 'active' ? '隐藏' : '恢复';

  async function handleToggle() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/memory/toggle-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memoryCardId,
          status: nextStatus,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || '状态更新失败');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className="rounded-xl border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
      >
        {loading ? '处理中...' : buttonText}
      </button>

      {error ? <div className="text-xs text-red-600">{error}</div> : null}
    </div>
  );
}