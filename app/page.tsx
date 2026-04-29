import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Lover Memory Copilot</h1>
          <p className="mt-2 text-sm text-gray-600">
            基于情侣聊天 JSON 构建关系记忆的 AI Copilot
          </p>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">当前可用页面</h2>
          <p className="mt-2 text-sm text-gray-600">
            你已经完成了关系复盘、长期关系记忆和关系问答的核心开发。
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/review"
              className="inline-flex rounded-xl border px-4 py-2 text-sm font-medium"
            >
              打开关系复盘页
            </Link>

            <Link
              href="/qa"
              className="inline-flex rounded-xl border px-4 py-2 text-sm font-medium"
            >
              打开关系问答页
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}