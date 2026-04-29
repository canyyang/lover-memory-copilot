import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { imports, relations } from '@/lib/db/schema';
import { AskForm } from '@/components/qa/ask-form';

export default async function QAPage() {
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
          <h1 className="text-3xl font-bold">关系问答</h1>
          <div className="rounded-2xl border p-6">
            <p className="text-base">当前没有可用的关系数据。</p>
            <p className="mt-2 text-sm text-gray-600">
              请先完成聊天导入、session 切分、结构化复盘和长期关系记忆构建。
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

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">关系问答</h1>
            <p className="mt-2 text-sm text-gray-600">
              基于聊天阶段复盘和长期关系记忆，对这段关系进行问答
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/review" className="text-sm underline">
              返回关系复盘
            </Link>
            <Link href="/" className="text-sm underline">
              返回首页
            </Link>
          </div>
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
          </div>

          <div className="rounded-2xl border p-5">
            <div className="text-sm text-gray-500">关系 ID</div>
            <div className="mt-2 break-all text-sm text-gray-700">
              {latestImport.relationId}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border p-5">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">开始提问</h2>
            <p className="mt-1 text-sm text-gray-600">
              你可以围绕这段关系提问，例如：最近主要卡在哪些问题上、哪些互动代表回暖、谁更在意什么。
            </p>
          </div>

          <AskForm relationId={latestImport.relationId} />
        </section>
      </div>
    </main>
  );
}