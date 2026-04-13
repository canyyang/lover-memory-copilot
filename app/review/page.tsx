import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { imports, relations, sessions } from '@/lib/db/schema';

function formatDateTime(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  return date.toLocaleString('zh-CN', {
    hour12: false,
  });
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
        <div className="mx-auto max-w-4xl space-y-4">
          <h1 className="text-2xl font-bold">关系复盘</h1>
          <div className="rounded-2xl border p-6">
            <p className="text-base">还没有可用的导入数据。</p>
            <p className="mt-2 text-sm text-gray-600">
              请先完成 V1.4 导入，再完成 V1.5 的 session 切分。
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

  // 2. 找到这次导入对应的 relation
  const relationRows = await db
    .select()
    .from(relations)
    .where(eq(relations.id, latestImport.relationId))
    .limit(1);

  const relation = relationRows[0] ?? null;

  // 3. 读取这次导入下的全部 sessions
  const sessionRows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.importId, latestImport.id))
    .orderBy(desc(sessions.startAt));

  const totalMessages = sessionRows.reduce((sum, session) => sum + session.messageCount, 0);

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">关系复盘</h1>
            <p className="mt-2 text-sm text-gray-600">
              基于最近一次导入生成的最基础复盘结果
            </p>
          </div>

          <Link href="/" className="text-sm underline">
            返回首页
          </Link>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
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
            <div className="text-sm text-gray-500">复盘概览</div>
            <div className="mt-2 text-lg font-semibold">
              {sessionRows.length} 个聊天阶段 / {totalMessages} 条文本消息
            </div>
            <div className="mt-1 text-xs text-gray-500">
              状态：{latestImport.status}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border p-5">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">聊天阶段列表</h2>
            <p className="mt-1 text-sm text-gray-600">
              当前按时间间隔切分，先展示最基础的阶段信息
            </p>
          </div>

          {sessionRows.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
              当前导入还没有切分出 session。请先完成 V1.5。
            </div>
          ) : (
            <div className="space-y-4">
              {sessionRows.map((session, index) => (
                <div key={session.id} className="rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm text-gray-500">
                        阶段 {sessionRows.length - index}
                      </div>
                      <div className="mt-1 text-lg font-semibold">
                        {session.title ?? '未命名聊天阶段'}
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      {session.messageCount} 条消息
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-gray-700 md:grid-cols-2">
                    <div>
                      <span className="text-gray-500">开始时间：</span>
                      {formatDateTime(session.startAt)}
                    </div>
                    <div>
                      <span className="text-gray-500">结束时间：</span>
                      {formatDateTime(session.endAt)}
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    <span className="text-gray-500">摘要：</span>
                    {session.summary ?? '当前版本还没有生成摘要'}
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