'use client';

type MemoryTypeFilter =
  | 'all'
  | 'partner_pattern'
  | 'user_pattern'
  | 'interaction_pattern'
  | 'unresolved_issue'
  | 'positive_signal';

type MemoryFilterBarProps = {
  value: MemoryTypeFilter;
  onChange: (value: MemoryTypeFilter) => void;
  counts: Record<MemoryTypeFilter, number>;
};

const filterOptions: Array<{
  value: MemoryTypeFilter;
  label: string;
}> = [
  { value: 'all', label: '全部' },
  { value: 'partner_pattern', label: '对方模式' },
  { value: 'user_pattern', label: '用户模式' },
  { value: 'interaction_pattern', label: '互动模式' },
  { value: 'unresolved_issue', label: '未闭环议题' },
  { value: 'positive_signal', label: '积极信号' },
];

export function MemoryFilterBar({
  value,
  onChange,
  counts,
}: MemoryFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filterOptions.map((option) => {
        const active = value === option.value;
        const count = counts[option.value] ?? 0;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              active
                ? 'border-black bg-black text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {option.label}（{count}）
          </button>
        );
      })}
    </div>
  );
}