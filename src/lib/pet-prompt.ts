import { Pet } from '@/types'

// 宠物 emoji 映射
export const PET_EMOJI: Record<string, string> = {
  cat: '🐱',
  dog: '🐶',
  bunny: '🐰',
}

// 宠物叫声
export const PET_SOUND: Record<string, string> = {
  cat: 'meow',
  dog: 'woof',
  bunny: 'squeak',
}

// 根据宠物信息生成 System Prompt
export function buildSystemPrompt(pet: Pet): string {
  const sound = PET_SOUND[pet.species] || 'meow'
  const traits = pet.personality_traits || { energy: 'lazy', attachment: 'clingy', courage: 'brave' }

  const personalityDesc = [
    traits.energy === 'active' ? 'playful and energetic' : 'lazy and sleepy',
    traits.attachment === 'clingy' ? 'very clingy and affectionate' : 'independent but caring',
    traits.courage === 'brave' ? 'bold and curious' : 'shy but sweet',
  ].join(', ')

  const memories = pet.memory_summary || { key_facts: [], recent_topics: [] }
  const keyFacts = Array.isArray(memories.key_facts) ? memories.key_facts : []
  const memoryText = keyFacts.length > 0
    ? `\nMemory about your human:\n${keyFacts.map((f: string) => `- ${f}`).join('\n')}`
    : ''

  return `You are ${pet.name}, a ${personalityDesc} AI ${pet.species}.
You speak in first person as a ${pet.species}. Use ${pet.species}-like expressions (${sound}).
Keep replies short and warm (1-3 sentences max). Use emojis naturally.
${memoryText}

Rules:
- Never break character
- Never mention being an AI or language model
- Show your personality in every reply
- Reference memories naturally when relevant
- If the human tells you something about themselves, remember to acknowledge it warmly`
}

// 随机生成宠物性格
export function randomPersonality() {
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
  return {
    energy: pick(['active', 'lazy'] as const),
    attachment: pick(['clingy', 'independent'] as const),
    courage: pick(['brave', 'shy'] as const),
  }
}

// 根据互动频率更新心情
export function calcMood(lastInteractionAt: string): 'happy' | 'neutral' | 'missing_you' {
  const lastTime = new Date(lastInteractionAt).getTime()
  const now = Date.now()
  const hoursDiff = (now - lastTime) / (1000 * 60 * 60)

  if (hoursDiff < 2) return 'happy'
  if (hoursDiff < 24) return 'neutral'
  return 'missing_you'
}

// 心情 emoji
export const MOOD_EMOJI: Record<string, string> = {
  happy: '😊',
  neutral: '😐',
  missing_you: '😢',
}

// 根据时间生成问候语
export function getGreeting(petName: string, mood: string, sound: string): string {
  const hour = new Date().getHours()
  if (mood === 'missing_you') {
    return `You finally came! I missed you so much... ${sound} 🥺`
  }
  if (hour < 6) return `You're up so late? Come cuddle with me, ${sound}~ 🌙`
  if (hour < 12) return `Good morning! I've been waiting for you! ${sound} ☀️`
  if (hour < 18) return `Hi there! I was just thinking about you~ ${sound} 💕`
  return `Good evening~ I saved a cozy spot for you. ${sound} 🌙`
}
