'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type MemoryCardEditorProps = {
  memoryCardId: string;
  initialTitle: string;
  initialContent: string;
  initialConfidence: 'high' | 'medium' | 'low';
};

export function MemoryCardEditor({
  memoryCardId,
  initialTitle,
  initialContent,
  initialConfidence,
}: MemoryCardEditorProps) {
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [confidence, setConfidence] = useState<'high' | 'medium' | 'low'>(
    initialConfidence
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleCancel() {
    setEditing(false);
    setTitle(initialTitle);
    setContent(initialContent);
    setConfidence(initialConfidence);
    setError('');
  }

  async function handleSave() {
    if (!title.trim()) {
      setError('标题不能为空');
      return;
    }

    if (!content.trim()) {
      setError('内容不能为空');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/memory/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memoryCardId,
          title: title.trim(),
          content: content.trim(),
          confidence,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || '保存失败');
      }

      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-xl border px-3 py-1.5 text-xs font-medium"
      >
        编辑
      </button>
    );
  }

  return (
    <div className="w-full space-y-3 rounded-xl border bg-slate-50 p-4">
      <div>
        <label className="block text-xs font-medium text-gray-600">标题</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600">内容</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600">置信度</label>
        <select
          value={confidence}
          onChange={(e) =>
            setConfidence(e.target.value as 'high' | 'medium' | 'low')
          }
          className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
        >
          <option value="high">high</option>
          <option value="medium">medium</option>
          <option value="low">low</option>
        </select>
      </div>

      {error ? <div className="text-xs text-red-600">{error}</div> : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="rounded-xl border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
        >
          {loading ? '保存中...' : '保存'}
        </button>

        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="rounded-xl border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
        >
          取消
        </button>
      </div>
    </div>
  );
}