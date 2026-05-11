import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { imports, memoryCards, relations, sessions } from '@/lib/db/schema';
import { MemorySection } from '@/components/review/memory-section';
import { generateAiOverview } from '@/lib/review/overview-ai';
import { KeySessionSection } from '@/components/review/key-session-section';

function formatDateTime(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  return date.toLocaleString('zh-CN', {
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

export default async function ReviewPage() {
  const latestImportRows = await db
    .select()
    .from(imports)
    .where(eq(imports.status, 'parsed'))
    .orderBy(desc(imports.createdAt))
    .limit(1);

  if (latestImportRows.length === 0) {
    return (
      <main className="min-h-screen bg-white p-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <h1 className="text-2xl font-bold">关系复盘</h1>
          <div className="rounded-2xl border p-6">
            <p className="text-base">当前还没有可用的关系复盘数据。</p>
            <p className="mt-2 text-sm text-gray-600">
              请先完成聊天导入、session 切分和结构化分析。
            </p>
            <div className="mt-4">
              <Link href="/" className="underline">
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const latestImport = latestImportRows[0];

  const relationRows = await db
    .select()
    .from(relations)
    .where(eq(relations.id, latestImport.relationId))
    .limit(1);

  const relation = relationRows[0] ?? null;

  const sessionRows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.importId, latestImport.id))
    .orderBy(desc(sessions.startAt));

  const memoryCardRows = await db
    .select()
    .from(memoryCards)
    .where(eq(memoryCards.relationId, latestImport.relationId))
    .orderBy(desc(memoryCards.createdAt));

  const totalMessages = sessionRows.reduce((sum, session) => sum + session.messageCount, 0);
  const keySessionRows = sessionRows.filter((session) => session.isKeySession);
  const keySessionCount = keySessionRows.length;
  const activeMemoryCount = memoryCardRows.filter((card) => card.status === 'active').length;

  const overviewText = await generateAiOverview({
    keySessions: keySessionRows.map((s) => ({
      title: s.title,
      summary: s.summary,
      moodLabel: s.moodLabel,
      signalLabel: s.signalLabel,
    })),
    memoryCards: memoryCardRows.map((m) => ({
      memoryType: m.memoryType,
      title: m.title,
      content: m.content,
      confidence: m.confidence,
      status: m.status,
    })),
    totalSessions: sessionRows.length,
    totalMessages,
  });

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">关系复盘</h1>
            <p className="mt-2 text-sm text-gray-600">
              基于最近一次导入生成的结构化复盘、长期关系记忆与关键阶段分析
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <a href="#overview" className="underline">
              总览
            </a>
            <a href="#key-sessions" className="underline">
              关键阶段
            </a>
            <a href="#memories" className="underline">
              长期记忆
            </a>
            <a href="#all-sessions" className="underline">
              全部阶段
            </a>
            <Link href="/qa" className="underline">
              去关系问答
            </Link>
            <Link href="/" className="underline">
              返回首页
            </Link>
          </div>
        </div>

        <section id="overview" className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border p-5 shadow-sm">
            <div className="text-sm text-gray-500">关系标题</div>
            <div className="mt-2 text-lg font-semibold">
              {relation?.title ?? '未命名关系'}
            </div>
          </div>

          <div className="rounded-2xl border p-5 shadow-sm">
            <div className="text-sm text-gray-500">最近导入文件</div>
            <div className="mt-2 text-lg font-semibold">{latestImport.fileName}</div>
            <div className="mt-1 text-xs text-gray-500">
              导入时间：{formatDateTime(latestImport.createdAt)}
            </div>
          </div>

          <div className="rounded-2xl border p-5 shadow-sm">
            <div className="text-sm text-gray-500">聊天阶段 / 消息</div>
            <div className="mt-2 text-lg font-semibold">
              {sessionRows.length} 个阶段 / {totalMessages} 条消息
            </div>
            <div className="mt-1 text-xs text-gray-500">
              关键阶段：{keySessionCount} 个
            </div>
          </div>

          <div className="rounded-2xl border p-5 shadow-sm">
            <div className="text-sm text-gray-500">长期关系记忆</div>
            <div className="mt-2 text-lg font-semibold">
              {memoryCardRows.length} 张卡片
            </div>
            <div className="mt-1 text-xs text-gray-500">
              active：{activeMemoryCount} / hidden：{memoryCardRows.length - activeMemoryCount}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border p-6 shadow-sm">
          <div className="mb-3">
            <h2 className="text-xl font-semibold">关系总览摘要</h2>
            <p className="mt-1 text-sm text-gray-600">
              基于关键阶段和长期关系记忆自动生成的高层总结
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm leading-7 text-gray-800">
            {overviewText || '当前无法生成总览摘要'}
          </div>
        </section>

        <section id="key-sessions" className="rounded-2xl border p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">关键阶段</h2>
            <p className="mt-1 text-sm text-gray-600">
              优先展示被识别为关键阶段的聊天片段，并按重要性排序，便于先看最值得关注的部分
            </p>
          </div>

          {keySessionRows.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
              当前还没有关键阶段。
            </div>
          ) : (
            <KeySessionSection
              sessions={keySessionRows.map((session) => ({
                id: session.id,
                title: session.title,
                summary: session.summary,
                moodLabel: session.moodLabel,
                signalLabel: session.signalLabel,
                startAt: new Date(session.startAt).toISOString(),
                endAt: new Date(session.endAt).toISOString(),
                messageCount: session.messageCount,
                topicTags: Array.isArray(session.topicTags) ? session.topicTags : [],
              }))}
            />
          )}
        </section>

        <section id="memories" className="rounded-2xl border p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">长期关系记忆</h2>
            <p className="mt-1 text-sm text-gray-600">
              基于多个聊天阶段提炼出的长期规律、未闭环议题和积极信号
            </p>
          </div>

          {memoryCardRows.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
              当前关系还没有生成长期关系记忆卡片。请先完成 V3.4。
            </div>
          ) : (
            <MemorySection
              memoryCards={memoryCardRows.map((card) => ({
                id: card.id,
                memoryType: card.memoryType,
                title: card.title,
                content: card.content,
                confidence: card.confidence,
                status: card.status,
                evidenceSessionIds: Array.isArray(card.evidenceSessionIds)
                  ? card.evidenceSessionIds
                  : [],
                createdAt: new Date(card.createdAt).toISOString(),
              }))}
              sessionMapData={sessionRows.map((session) => ({
                id: session.id,
                title: session.title,
                summary: session.summary,
                startAt: new Date(session.startAt).toISOString(),
                endAt: new Date(session.endAt).toISOString(),
                messageCount: session.messageCount,
              }))}
            />
          )}
        </section>

        <section id="all-sessions" className="rounded-2xl border p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">完整聊天阶段列表</h2>
            <p className="mt-1 text-sm text-gray-600">
              完整展示每个阶段的摘要、话题标签、整体氛围和关系信号
            </p>
          </div>

          {sessionRows.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
              当前导入还没有切分出 session。
            </div>
          ) : (
            <div className="space-y-4">
              {sessionRows.map((session, index) => (
                <div
                  id={`session-${session.id}`}
                  key={session.id}
                  className={`scroll-mt-24 rounded-2xl border p-5 ${session.isKeySession ? 'border-red-200 bg-red-50/30' : ''
                    }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-gray-500">
                          阶段 {sessionRows.length - index}
                        </span>

                        {session.isKeySession ? (
                          <span className="rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                            关键阶段
                          </span>
                        ) : null}
                      </div>

                      <h3 className="text-xl font-semibold">
                        {session.title ?? '未命名聊天阶段'}
                      </h3>

                      <div className="flex flex-wrap gap-2">
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
                    </div>

                    <div className="text-sm text-gray-500">
                      {session.messageCount} 条消息
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl bg-gray-50 p-4">
                      <div className="text-sm text-gray-500">开始时间</div>
                      <div className="mt-1 text-sm font-medium text-gray-800">
                        {formatDateTime(session.startAt)}
                      </div>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                      <div className="text-sm text-gray-500">结束时间</div>
                      <div className="mt-1 text-sm font-medium text-gray-800">
                        {formatDateTime(session.endAt)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 p-4">
                    <div className="text-sm text-gray-500">阶段摘要</div>
                    <div className="mt-2 text-sm leading-6 text-gray-800">
                      {session.summary ?? '当前阶段还没有生成摘要'}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm text-gray-500">话题标签</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Array.isArray(session.topicTags) && session.topicTags.length > 0 ? (
                        session.topicTags.map((tag, tagIndex) => (
                          <span
                            key={`${session.id}-${tagIndex}`}
                            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">当前阶段还没有话题标签</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}