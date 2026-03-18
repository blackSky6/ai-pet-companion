import { createOpenAI } from '@ai-sdk/openai';

export const zhipu = createOpenAI({
  apiKey: process.env.ZHIPU_API_KEY,
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
});

// 使用 glm-4-flash 模型，速度快且免费
export const chatModel = zhipu('glm-4-flash');