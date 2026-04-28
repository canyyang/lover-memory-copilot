import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { imports, memoryCards, relations, sessions } from '@/lib/db/schema';

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

export default async function ReviewPage() {
  // 1. 找最近一次已解析完成的导入记录
  const latestImportRows = await db
    .select()
    .from(imports)
    .where(eq(imports.status, 'parsed'))
    .orderBy(desc(imports.createdAt))
    .limit(1);

  if (latestImportRows.length === 0) {
    return (
      <main className="min-h-screen p-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <h1 className="text-2xl font-bold">关系复盘</h1>
          <div className="rounded-2xl border p-6">
            <p className="text-base">还没有可用的导入数据。</p>
            <p className="mt-2 text-sm text-gray-600">
              请先完成导入、session 切分和结构化分析。
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

  // 2. 找对应 relation
  const relationRows = await db
    .select()
    .from(relations)
    .where(eq(relations.id, latestImport.relationId))
    .limit(1);

  const relation = relationRows[0] ?? null;

  // 3. 读取 session
  const sessionRows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.importId, latestImport.id))
    .orderBy(desc(sessions.startAt));

  // 4. 读取当前关系下的长期记忆卡片
  const memoryCardRows = await db
    .select()
    .from(memoryCards)
    .where(eq(memoryCards.relationId, latestImport.relationId))
    .orderBy(desc(memoryCards.createdAt));

  const totalMessages = sessionRows.reduce((sum, session) => sum + session.messageCount, 0);
  const keySessionCount = sessionRows.filter((session) => session.isKeySession).length;

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">关系复盘</h1>
            <p className="mt-2 text-sm text-gray-600">
              基于最近一次导入生成的结构化复盘与长期关系记忆
            </p>
          </div>

          <Link href="/" className="text-sm underline">
            返回首页
          </Link>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border p-5">
            <div className="text-sm text-gray-500">关系标题</div>
            <div className="mt-2 text-lg font-semibold">
              {relation?.title ?? '未命名关系'}
            </div>
          </div>

          <div className="rounded-2xl border p-5">
            <div className="text-sm text-gray-500">最近导入文件</div>
            <div className="mt-2 text-lg font-semibold">{latestImport.fileName}</div>
            <div className="mt-1 text-xs text-gray-500">
              导入时间：{formatDateTime(latestImport.createdAt)}
            </div>
          </div>

          <div className="rounded-2xl border p-5">
            <div className="text-sm text-gray-500">聊天阶段数</div>
            <div className="mt-2 text-lg font-semibold">{sessionRows.length} 个阶段</div>
            <div className="mt-1 text-xs text-gray-500">
              共 {totalMessages} 条文本消息
            </div>
          </div>

          <div className="rounded-2xl border p-5">
            <div className="text-sm text-gray-500">长期关系记忆</div>
            <div className="mt-2 text-lg font-semibold">{memoryCardRows.length} 张卡片</div>
            <div className="mt-1 text-xs text-gray-500">
              关键阶段：{keySessionCount} 个
            </div>
          </div>
        </section>

        <section className="rounded-2xl border p-5">
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
            <div className="grid gap-4 md:grid-cols-2">
              {memoryCardRows.map((card) => (
                <div key={card.id} className="rounded-2xl border p-5">
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

                    <span className="rounded-full border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700">
                      状态：{card.status}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-semibold">{card.title}</h3>

                  <p className="mt-3 text-sm leading-6 text-gray-700">{card.content}</p>

                  <div className="mt-4 rounded-xl bg-slate-50 p-4">
                    <div className="text-sm text-gray-500">证据阶段</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Array.isArray(card.evidenceSessionIds) && card.evidenceSessionIds.length > 0 ? (
                        card.evidenceSessionIds.map((sessionId, index) => (
                          <span
                            key={`${card.id}-${index}`}
                            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700"
                          >
                            {sessionId}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">暂无证据阶段</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    创建时间：{formatDateTime(card.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border p-5">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">聊天阶段结构化复盘</h2>
            <p className="mt-1 text-sm text-gray-600">
              展示每个阶段的摘要、话题标签、整体氛围和关系信号
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
                  key={session.id}
                  className={`rounded-2xl border p-5 ${
                    session.isKeySession ? 'border-red-200 bg-red-50/30' : ''
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