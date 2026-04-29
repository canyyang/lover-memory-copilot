import Link from 'next/link';

const pages = [
  {
    title: '关系复盘',
    href: '/review',
    description: '查看聊天阶段的结构化复盘结果，以及长期关系记忆卡片。',
  },
  {
    title: '关系问答',
    href: '/qa',
    description: '围绕这段关系提问，基于 session 和长期记忆得到结构化回答。',
  },
  {
    title: '问答历史',
    href: '/qa/history',
    description: '查看已经保存的历史问答记录、关键点和引用依据。',
  },
];

const milestones = [
  'V1：聊天 JSON 导入、文本清洗、session 切分、基础复盘页',
  'V2：session 结构化分析（摘要、话题、氛围、关系信号）',
  'V3：长期关系记忆卡片（pattern / unresolved issue / positive signal）',
  'V4：基于关系知识的问答页与正式问答 API',
  'V5：问答记录、历史页、最小评测脚本、工程收尾',
];

const devCommands = [
  'npm install',
  'npm run db:migrate',
  'npm run dev',
  'npm run qa:eval',
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white p-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="rounded-2xl border p-6">
          <h1 className="text-3xl font-bold">Lover Memory Copilot</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600">
            一个基于情侣聊天 JSON 构建关系记忆的 AI Copilot。
            当前已经支持：聊天导入、session 复盘、长期关系记忆提炼、基于关系知识的问答、问答历史记录和最小评测脚本。
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {pages.map((page) => (
            <div key={page.href} className="rounded-2xl border p-5">
              <h2 className="text-xl font-semibold">{page.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {page.description}
              </p>
              <div className="mt-4">
                <Link
                  href={page.href}
                  className="inline-flex rounded-xl border px-4 py-2 text-sm font-medium"
                >
                  打开页面
                </Link>
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border p-5">
            <h2 className="text-xl font-semibold">当前版本进度</h2>
            <ul className="mt-4 space-y-3 text-sm text-gray-700">
              {milestones.map((item) => (
                <li key={item} className="leading-6">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border p-5">
            <h2 className="text-xl font-semibold">常用开发命令</h2>
            <div className="mt-4 space-y-3">
              {devCommands.map((command) => (
                <div
                  key={command}
                  className="rounded-xl bg-slate-50 px-4 py-3 font-mono text-sm text-gray-800"
                >
                  {command}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}