import { NextRequest, NextResponse } from 'next/server'
import { Pet } from '@/types'
import { buildSystemPrompt } from '@/lib/pet-prompt'

// 调用智谱 GLM-4-Flash API
async function callGLM(messages: { role: string; content: string }[]) {
  const res = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ZHIPU_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'glm-4-flash',
      messages,
      max_tokens: 150,
      temperature: 0.9,
    }),
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? 'meow...'
}

export async function POST(req: NextRequest) {
  try {
    const { message, pet, history } = await req.json()

    if (!message || !pet) {
      return NextResponse.json({ error: 'Missing message or pet' }, { status: 400 })
    }

    // 构建对话历史（最近10轮）
    const recentHistory = (history || []).slice(-10)
    const chatMessages = [
      { role: 'system', content: buildSystemPrompt(pet as Pet) },
      ...recentHistory.map((m: { role: string; content: string }) => ({
        role: m.role === 'pet' ? 'assistant' : 'user',
        content: m.content,
      })),
      { role: 'user', content: message },
    ]

    const reply = await callGLM(chatMessages)

    // 异步提取记忆关键信息（简单版：检测用户是否透露个人信息）
    const newFacts: string[] = []
    const lowerMsg = message.toLowerCase()
    if (lowerMsg.includes("my name is") || lowerMsg.includes("i'm ") || lowerMsg.includes("i am ")) {
      newFacts.push(message.trim())
    }

    return NextResponse.json({ reply, newFacts })
  } catch (e) {
    console.error('Chat API error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
