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
          <h2 className="text-xl font-semibold">当前开发进度</h2>
          <p className="mt-2 text-sm text-gray-600">
            你已经完成了 V1.4 导入和 V1.5 session 切分，现在可以查看最基础的关系复盘页。
          </p>

          <div className="mt-4">
            <Link
              href="/review"
              className="inline-flex rounded-xl border px-4 py-2 text-sm font-medium"
            >
              打开关系复盘页
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}