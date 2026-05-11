'use client';

import { useMemo, useState } from 'react';

type KeySessionItem = {
  id: string;
  title: string | null;
  summary: string | null;
  moodLabel: string | null;
  signalLabel: string | null;
  startAt: string;
  endAt: string;
  messageCount: number;
  topicTags: string[];
};

type KeySessionSectionProps = {
  sessions: KeySessionItem[];
};

const DEFAULT_VISIBLE_COUNT = 4;

function scoreKeySession(session: KeySessionItem) {
  let score = 0;

  if (session.signalLabel === '需要关注') score += 5;
  if (session.signalLabel === '情绪波动') score += 4;
  if (session.signalLabel === '试探承诺') score += 3;
  if (session.signalLabel === '关系升温') score += 3;
  if (session.signalLabel === '互相关心') score += 2;

  if (session.moodLabel === '不安') score += 3;
  if (session.moodLabel === '认真') score += 2;
  if (session.moodLabel === '试探') score += 2;
  if (session.moodLabel === '低落') score += 2;
  if (session.moodLabel === '安抚') score += 1;

  score += Math.min(session.messageCount, 30) * 0.08;
  score += Math.min(session.topicTags.length, 5) * 0.5;

  return score;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('zh-CN', {
    hour12: false,
  });
}

function getMoodBadgeClass(moodLabel: string | null) {
  switch (moodLabel) {
    case '轻松':
      return 'bg-green-50 text-green-700 border-green-200';
    case '暧昧':
      return 'bg-pink-50 text-pink-700 border-pink-200';
    case '不安':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case '安抚':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case '试探':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case '认真':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case '低落':
      return 'bg-slate-100 text-slate-700 border-slate-300';
    case '日常':
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

function getSignalBadgeClass(signalLabel: string | null) {
  switch (signalLabel) {
    case '关系升温':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case '互相关心':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case '情绪波动':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case '试探承诺':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case '需要关注':
      return 'bg-red-50 text-red-700 border-red-200';
    case '普通互动':
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

export function KeySessionSection({ sessions }: KeySessionSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const rankedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const scoreDiff = scoreKeySession(b) - scoreKeySession(a);
      if (scoreDiff !== 0) return scoreDiff;

      return new Date(b.startAt).getTime() - new Date(a.startAt).getTime();
    });
  }, [sessions]);

  const visibleSessions = expanded
    ? rankedSessions
    : rankedSessions.slice(0, DEFAULT_VISIBLE_COUNT);

  const hiddenCount = Math.max(0, rankedSessions.length - DEFAULT_VISIBLE_COUNT);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-500">
          共识别出 <span className="font-medium text-gray-800">{sessions.length}</span> 个关键阶段，
          当前按“关系信号 + 氛围 + 消息量”综合排序展示。
        </div>

        {rankedSessions.length > DEFAULT_VISIBLE_COUNT ? (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="rounded-xl border px-3 py-1.5 text-xs font-medium"
          >
            {expanded ? '收起' : `展开剩余 ${hiddenCount} 个关键阶段`}
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {visibleSessions.map((session, index) => (
          <a
            key={session.id}
            href={`#session-${session.id}`}
            className="block rounded-2xl border border-red-200 bg-red-50/30 p-5 transition hover:bg-red-50/50"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2">
                  <span className="rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                    关键阶段
                  </span>
                  <span className="text-xs text-gray-500">
                    Top {index + 1}
                  </span>
                </div>

                <h3 className="text-lg font-semibold">
                  {session.title ?? '未命名聊天阶段'}
                </h3>
              </div>

              <div className="text-xs text-gray-500">{session.messageCount} 条消息</div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-2 py-1 text-xs font-medium ${getMoodBadgeClass(
                  session.moodLabel
                )}`}
              >
                氛围：{session.moodLabel ?? '未分析'}
              </span>

              <span
                className={`rounded-full border px-2 py-1 text-xs font-medium ${getSignalBadgeClass(
                  session.signalLabel
                )}`}
              >
                信号：{session.signalLabel ?? '未分析'}
              </span>
            </div>

            <div className="mt-3 text-xs text-gray-500">
              {formatDateTime(session.startAt)} - {formatDateTime(session.endAt)}
            </div>

            <div className="mt-3 text-sm leading-6 text-gray-700">
              {session.summary ?? '当前阶段还没有生成摘要'}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {session.topicTags.length > 0 ? (
                session.topicTags.slice(0, 4).map((tag, tagIndex) => (
                  <span
                    key={`${session.id}-${tagIndex}`}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500">暂无话题标签</span>
              )}
            </div>

            <div className="mt-3 text-xs text-blue-600">点击跳转到详细阶段</div>
          </a>
        ))}
      </div>
    </div>
  );
}