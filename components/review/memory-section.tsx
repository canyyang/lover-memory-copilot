'use client';

import { MemoryFilterBar } from './memory-filter-bar';
import { MemoryCardActions } from './memory-card-actions';
import { MemoryCardEditor } from './memory-card-editor';

import { useMemo, useState } from 'react';

type MemoryTypeFilter =
  | 'all'
  | 'partner_pattern'
  | 'user_pattern'
  | 'interaction_pattern'
  | 'unresolved_issue'
  | 'positive_signal';

type MemoryCardItem = {
  id: string;
  memoryType: string;
  title: string;
  content: string;
  confidence: string;
  status: string;
  evidenceSessionIds: string[];
  createdAt: string;
};

type SessionItem = {
  id: string;
  title: string | null;
  summary: string | null;
  startAt: string;
  endAt: string;
  messageCount: number;
};

type MemorySectionProps = {
  memoryCards: MemoryCardItem[];
  sessionMapData: SessionItem[];
};

function groupLabel(type: string) {
  switch (type) {
    case 'partner_pattern':
      return '对方模式';
    case 'user_pattern':
      return '用户模式';
    case 'interaction_pattern':
      return '互动模式';
    case 'unresolved_issue':
      return '未闭环议题';
    case 'positive_signal':
      return '积极信号';
    default:
      return type;
  }
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('zh-CN', {
    hour12: false,
  });
}

function getMemoryTypeLabel(memoryType: string) {
  switch (memoryType) {
    case 'partner_pattern':
      return '对方模式';
    case 'user_pattern':
      return '用户模式';
    case 'interaction_pattern':
      return '互动模式';
    case 'unresolved_issue':
      return '未闭环议题';
    case 'positive_signal':
      return '积极信号';
    default:
      return memoryType;
  }
}

function getMemoryTypeBadgeClass(memoryType: string) {
  switch (memoryType) {
    case 'partner_pattern':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'user_pattern':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'interaction_pattern':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'unresolved_issue':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'positive_signal':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

function getConfidenceLabel(confidence: string) {
  switch (confidence) {
    case 'high':
      return '高';
    case 'medium':
      return '中';
    case 'low':
      return '低';
    default:
      return confidence;
  }
}

export function MemorySection({
  memoryCards,
  sessionMapData,
}: MemorySectionProps) {
  const [filter, setFilter] = useState<MemoryTypeFilter>('all');

  const sessionMap = useMemo(
    () => new Map(sessionMapData.map((session) => [session.id, session])),
    [sessionMapData]
  );

  const counts = useMemo(() => {
    const base: Record<MemoryTypeFilter, number> = {
      all: memoryCards.length,
      partner_pattern: 0,
      user_pattern: 0,
      interaction_pattern: 0,
      unresolved_issue: 0,
      positive_signal: 0,
    };

    for (const card of memoryCards) {
      if (card.memoryType in base) {
        base[card.memoryType as MemoryTypeFilter] += 1;
      }
    }

    return base;
  }, [memoryCards]);

  const filteredCards = useMemo(() => {
    if (filter === 'all') {
      return memoryCards;
    }

    return memoryCards.filter((card) => card.memoryType === filter);
  }, [filter, memoryCards]);

  const groupedCards = useMemo(() => {
    if (filter !== 'all') {
      return [
        {
          type: filter,
          label: groupLabel(filter),
          items: filteredCards,
        },
      ];
    }

    const order: MemoryTypeFilter[] = [
      'partner_pattern',
      'user_pattern',
      'interaction_pattern',
      'unresolved_issue',
      'positive_signal',
    ];

    return order
      .map((type) => ({
        type,
        label: groupLabel(type),
        items: filteredCards.filter((card) => card.memoryType === type),
      }))
      .filter((group) => group.items.length > 0);
  }, [filter, filteredCards]);

  return (
    <div className="space-y-5">
      <MemoryFilterBar value={filter} onChange={setFilter} counts={counts} />

      {filteredCards.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
          当前筛选条件下没有记忆卡片。
        </div>
      ) : (
        groupedCards.map((group) => (
          <div key={group.type} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{group.label}</h3>
              <div className="text-sm text-gray-500">{group.items.length} 张卡片</div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {group.items.map((card) => (
                <div
                  key={card.id}
                  className={`rounded-2xl border p-5 ${
                    card.status === 'hidden' ? 'border-dashed opacity-70' : ''
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2 py-1 text-xs font-medium ${getMemoryTypeBadgeClass(
                            card.memoryType
                          )}`}
                        >
                          {getMemoryTypeLabel(card.memoryType)}
                        </span>

                        <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700">
                          置信度：{getConfidenceLabel(card.confidence)}
                        </span>

                        <span
                          className={`rounded-full border px-2 py-1 text-xs ${
                            card.status === 'active'
                              ? 'border-green-200 bg-green-50 text-green-700'
                              : 'border-gray-200 bg-gray-50 text-gray-600'
                          }`}
                        >
                          状态：{card.status}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold">{card.title}</h3>
                    </div>

                    <div className="flex flex-col gap-2 md:items-end">
                      <MemoryCardActions
                        memoryCardId={card.id}
                        status={card.status as 'active' | 'hidden'}
                      />

                      <MemoryCardEditor
                        memoryCardId={card.id}
                        initialTitle={card.title}
                        initialContent={card.content}
                        initialConfidence={card.confidence as 'high' | 'medium' | 'low'}
                      />
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-gray-700">{card.content}</p>

                  <div className="mt-4 rounded-xl bg-slate-50 p-4">
                    <div className="text-sm text-gray-500">证据阶段</div>

                    {Array.isArray(card.evidenceSessionIds) &&
                    card.evidenceSessionIds.length > 0 ? (
                      <div className="mt-3 space-y-3">
                        {card.evidenceSessionIds.map((sessionId, index) => {
                          const evidenceSession = sessionMap.get(sessionId);

                          if (!evidenceSession) {
                            return (
                              <div
                                key={`${card.id}-${index}`}
                                className="rounded-xl border border-dashed border-gray-200 bg-white p-3"
                              >
                                <div className="text-xs text-gray-500">未找到对应阶段</div>
                                <div className="mt-1 break-all text-xs text-gray-700">
                                  {sessionId}
                                </div>
                              </div>
                            );
                          }

                          return (
                            <a
                              key={`${card.id}-${index}`}
                              href={`#session-${evidenceSession.id}`}
                              className="block rounded-xl border border-gray-200 bg-white p-3 transition hover:bg-gray-50"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="text-sm font-medium text-gray-900">
                                  {evidenceSession.title ?? '未命名聊天阶段'}
                                </div>

                                <div className="text-xs text-gray-500">
                                  {evidenceSession.messageCount} 条消息
                                </div>
                              </div>

                              <div className="mt-2 text-xs text-gray-500">
                                {formatDateTime(evidenceSession.startAt)} -{' '}
                                {formatDateTime(evidenceSession.endAt)}
                              </div>

                              <div className="mt-2 text-sm text-gray-700">
                                {evidenceSession.summary ?? '当前阶段还没有生成摘要'}
                              </div>

                              <div className="mt-2 text-xs text-blue-600">
                                点击跳转到该聊天阶段
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-gray-500">暂无证据阶段</div>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    创建时间：{formatDateTime(card.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}