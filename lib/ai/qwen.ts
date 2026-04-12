import { ChatAlibabaTongyi } from '@langchain/community/chat_models/alibaba_tongyi';

export const qwen = new ChatAlibabaTongyi({
  model: 'qwen-plus',
  temperature: 0.2,
  // 在 Node.js 环境下，如果不显式传 alibabaApiKey，
  // 会默认读取 process.env.ALIBABA_API_KEY
});