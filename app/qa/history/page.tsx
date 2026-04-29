import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { qaRecords, relations } from '@/lib/db/schema';

function formatDateTime(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  return date.toLocaleString('zh-CN', {
    hour12: false,
  });
}

export default async function QAHistoryPage() {
  const records = await db
    .select()
    .from(qaRecords)
    .orderBy(desc(qaRecords.createdAt));

  const relationMap = new Map<string, string>();

  if (records.length > 0) {
    const uniqueRelationIds = [...new Set(records.map((item) => item.relationId))];

    for (const relationId of uniqueRelationIds) {
      const relationRows = await db
        .select()
        .from(relations)
        .where(eq(relations.id, relationId))
        .limit(1);

      const relation = relationRows[0];
      if (relation) {
        relationMap.set(relationId, relation.title);
      }
    }
  }

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">问答历史</h1>
            <p className="mt-2 text-sm text-gray-600">
              查看所有已经保存的关系问答记录
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/qa" className="text-sm underline">
              返回关系问答
            </Link>
            <Link href="/" className="text-sm underline">
              返回首页
            </Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border p-5">
            <div className="text-sm text-gray-500">问答记录数</div>
            <div className="mt-2 text-lg font-semibold">{records.length} 条</div>
          </div>

          <div className="rounded-2xl border p-5">
            <div className="text-sm text-gray-500">关联关系数</div>
            <div className="mt-2 text-lg font-semibold">{relationMap.size} 段关系</div>
          </div>

          <div className="rounded-2xl border p-5">
            <div className="text-sm text-gray-500">最新记录时间</div>
            <div className="mt-2 text-lg font-semibold">
              {records.length > 0 ? formatDateTime(records[0].createdAt) : '暂无记录'}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border p-5">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">历史记录列表</h2>
            <p className="mt-1 text-sm text-gray-600">
              每条记录包含问题、回答、关键点以及引用依据
            </p>
          </div>

          {records.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
              目前还没有问答历史。请先去关系问答页提一个问题。
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record, index) => (
                <div key={record.id} className="rounded-2xl border p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-sm text-gray-500">记录 {records.length - index}</div>
                      <div className="mt-1 text-lg font-semibold">
                        {relationMap.get(record.relationId) ?? '未命名关系'}
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      {formatDateTime(record.createdAt)}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm text-gray-500">问题</div>
                    <div className="mt-2 text-base font-medium text-gray-900">
                      {record.question}
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 p-4">
                    <div className="text-sm text-gray-500">回答</div>
                    <div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-800">
                      {record.answer}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm text-gray-500">关键点</div>
                    {Array.isArray(record.keyPoints) && record.keyPoints.length > 0 ? (
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-gray-800">
                        {record.keyPoints.map((point, pointIndex) => (
                          <li key={`${record.id}-point-${pointIndex}`}>{point}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="mt-2 text-sm text-gray-500">暂无关键点</div>
                    )}
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-gray-50 p-4">
                      <div className="text-sm text-gray-500">引用的聊天阶段</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Array.isArray(record.referencedSessionIds) &&
                        record.referencedSessionIds.length > 0 ? (
                          record.referencedSessionIds.map((id, idx) => (
                            <span
                              key={`${record.id}-session-${idx}`}
                              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700"
                            >
                              {id}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">未引用 session</span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                      <div className="text-sm text-gray-500">引用的长期记忆</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Array.isArray(record.referencedMemoryCardIds) &&
                        record.referencedMemoryCardIds.length > 0 ? (
                          record.referencedMemoryCardIds.map((id, idx) => (
                            <span
                              key={`${record.id}-memory-${idx}`}
                              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700"
                            >
                              {id}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">未引用 memory card</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-gray-500 break-all">
                    relationId：{record.relationId}
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