// 宠物相关类型定义
export type PetSpecies = 'cat' | 'dog' | 'bunny'

export interface PersonalityTraits {
  energy: 'active' | 'lazy'        // 活泼 vs 慵懒
  attachment: 'clingy' | 'independent' // 粘人 vs 独立
  courage: 'brave' | 'shy'         // 胆大 vs 胆小
}

export interface Pet {
  id: string
  user_id: string
  name: string
  species: PetSpecies
  appearance: string               // 配色方案
  personality_traits: PersonalityTraits
  intimacy_level: number           // 1-10
  mood: 'happy' | 'neutral' | 'missing_you'
  memory_summary: MemorySummary
  created_at: string
  last_interaction_at: string
}

export interface MemorySummary {
  key_facts: string[]              // 关键信息：["名字叫Alex", "喜欢咖啡"]
  recent_topics: string[]          // 最近话题
  user_name?: string               // 用户名字（如果告诉过宠物）
}

export interface Message {
  id: string
  pet_id: string
  role: 'user' | 'pet'
  content: string
  created_at: string
}

export interface User {
  id: string
  email: string
  display_name?: string
  created_at: string
  last_active_at: string
}
