type QAAnswerData = {
    relationId: string;
    question: string;
    answer: string;
    keyPoints: string[];
    referencedSessionIds: string[];
    referencedMemoryCardIds: string[];
  };
  
  type AnswerCardProps = {
    data: QAAnswerData;
  };
  
  export function AnswerCard({ data }: AnswerCardProps) {
    return (
      <div className="rounded-2xl border p-5 space-y-5">
        <div>
          <div className="text-sm text-gray-500">你的问题</div>
          <div className="mt-2 text-base font-medium text-gray-900">{data.question}</div>
        </div>
  
        <div>
          <div className="text-sm text-gray-500">AI 回答</div>
          <div className="mt-2 text-sm leading-7 text-gray-800 whitespace-pre-wrap">
            {data.answer}
          </div>
        </div>
  
        <div>
          <div className="text-sm text-gray-500">关键点</div>
          {data.keyPoints.length > 0 ? (
            <ul className="mt-2 list-disc pl-5 space-y-2 text-sm text-gray-800">
              {data.keyPoints.map((point, index) => (
                <li key={`${point}-${index}`}>{point}</li>
              ))}
            </ul>
          ) : (
            <div className="mt-2 text-sm text-gray-500">暂无关键点</div>
          )}
        </div>
  
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-sm text-gray-500">引用的聊天阶段</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.referencedSessionIds.length > 0 ? (
                data.referencedSessionIds.map((id) => (
                  <span
                    key={id}
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
  
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-sm text-gray-500">引用的长期记忆</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.referencedMemoryCardIds.length > 0 ? (
                data.referencedMemoryCardIds.map((id) => (
                  <span
                    key={id}
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
      </div>
    );
  }