'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Pet } from '@/types'
import { PET_EMOJI, PET_SOUND, MOOD_EMOJI, calcMood, getGreeting } from '@/lib/pet-prompt'
import { chatWithPet } from '@/lib/glm'

interface Message {
  role: 'user' | 'pet'
  content: string
}

export default function PetPage() {
  const router = useRouter()
  const [pet, setPet] = useState<Pet | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [msgCount, setMsgCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 加载宠物数据
  useEffect(() => {
    const demoData = localStorage.getItem('pawpal_pet_demo')
    if (demoData) {
      const p = JSON.parse(demoData) as Pet
      setPet(p)
      // 首次问候
      const greeting = getGreeting(p.name, p.mood, PET_SOUND[p.species])
      setMessages([{ role: 'pet', content: greeting }])
      return
    }

    const petId = localStorage.getItem('pawpal_pet_id')
    const userId = localStorage.getItem('pawpal_user_id')
    if (!petId && !userId) {
      router.push('/adopt')
      return
    }
    if (userId) {
      fetch(`/api/pet?user_id=${userId}`)
        .then(r => r.json())
        .then(data => {
          if (data.pet) {
            setPet(data.pet)
            const p = data.pet as Pet
            const greeting = getGreeting(p.name, p.mood, PET_SOUND[p.species])
            setMessages([{ role: 'pet', content: greeting }])
          } else {
            router.push('/adopt')
          }
        })
        .catch(() => router.push('/adopt'))
    }
  }, [router])

  // 自动滚到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async () => {
    if (!input.trim() || !pet || isTyping || msgCount >= 30) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setMsgCount(c => c + 1)
    setIsTyping(true)

    try {
      const reply = await chatWithPet(userMsg, pet, messages.slice(-10))
      setMessages(prev => [...prev, { role: 'pet', content: reply }])

      // 每5条消息增加一级亲密度，更新宠物状态
      const newCount = msgCount
      const updatedPet = {
        ...pet,
        intimacy_level: Math.min(10, (pet.intimacy_level || 1) + (newCount % 5 === 0 ? 1 : 0)),
        last_interaction_at: new Date().toISOString(),
      }
      setPet(updatedPet)
      localStorage.setItem('pawpal_pet_demo', JSON.stringify(updatedPet))
    } catch {
      setMessages(prev => [...prev, { role: 'pet', content: `${PET_SOUND[pet.species]}... (something went wrong, try again?)` }])
    } finally {
      setIsTyping(false)
    }
  }

  if (!pet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-4xl animate-bounce">🐾</div>
      </div>
    )
  }

  const petEmoji = PET_EMOJI[pet.species]
  const moodEmoji = MOOD_EMOJI[pet.mood || 'happy']
  const currentMood = calcMood(pet.last_interaction_at)

  return (
    <main className="max-w-md mx-auto px-4 py-4 min-h-screen flex flex-col">
      {/* Topbar */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => router.push('/')}
          className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-base"
        >←</button>
        <span className="text-sm text-gray-400">PawPal</span>
        <div className="text-lg">💗</div>
      </div>

      {/* Chat Shell */}
      <div className="flex-1 bg-gradient-to-b from-white to-pink-50/50 rounded-3xl shadow-xl p-4 flex flex-col">
        {/* Pet Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-100 to-yellow-50 flex items-center justify-center text-2xl shadow-sm">
              {petEmoji}
            </div>
            <div>
              <div className="font-black text-lg">{pet.name}</div>
              <div className="text-xs text-gray-400">Lv.{pet.intimacy_level} · Remembers you</div>
            </div>
          </div>
        </div>

        {/* Pet Stage */}
        <div className="relative bg-gradient-to-b from-pink-50/60 to-white rounded-2xl h-44 flex flex-col items-center justify-center mb-3 overflow-hidden">
          <div className="text-7xl" style={{ animation: 'bounce 2.5s ease-in-out infinite' }}>
            {petEmoji}
          </div>
          <div className="flex gap-2 mt-2 flex-wrap justify-center">
            <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">{moodEmoji} {currentMood.replace('_', ' ')}</span>
            <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">🔥 Bond {pet.intimacy_level}/10</span>
            <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">💬 {30 - msgCount} left</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-64 mb-3 px-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'pet'
                  ? 'bg-pink-50 text-purple-900 self-start rounded-bl-md'
                  : 'bg-pink-400 text-white self-end rounded-br-md'
              }`}
              style={{ wordBreak: 'break-word' }}
            >
              {msg.content}
            </div>
          ))}
          {isTyping && (
            <div className="bg-pink-50 text-purple-900 self-start px-4 py-3 rounded-2xl rounded-bl-md text-sm">
              <span className="animate-pulse">typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {msgCount >= 30 ? (
          <div className="text-center text-sm text-gray-400 py-2">
            Daily limit reached. Come back tomorrow! 🌙
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={`Say something to ${pet.name}...`}
              className="flex-1 px-4 py-3 rounded-2xl bg-white shadow-inner outline-none text-sm"
              disabled={isTyping}
            />
            <button
              onClick={sendMessage}
              disabled={isTyping || !input.trim()}
              className="w-12 rounded-2xl text-white font-bold text-lg shadow-md disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #ff6b9d 0%, #ff8f6b 100%)' }}
            >
              ➤
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </main>
  )
}
