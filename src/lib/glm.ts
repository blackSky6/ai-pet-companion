import { Pet } from '@/types'
import { buildSystemPrompt } from '@/lib/pet-prompt'

// AI 代理地址 — Key 安全存在 Cloudflare Worker 里
const AI_PROXY_URL = 'https://pawpal-ai-proxy.blacksky58.workers.dev'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function chatWithPet(
  userMessage: string,
  pet: Pet,
  history: { role: 'user' | 'pet'; content: string }[]
): Promise<string> {
  const recentHistory = history.slice(-10)

  const messages: ChatMessage[] = [
    { role: 'system', content: buildSystemPrompt(pet) },
    ...recentHistory.map(m => ({
      role: (m.role === 'pet' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ]

  const res = await fetch(AI_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, max_tokens: 150, temperature: 0.9 }),
  })

  if (!res.ok) throw new Error(`Proxy error: ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? '...'
}
