'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PETS = [
  { type: 'cat', emoji: '🐱', label: 'Cat' },
  { type: 'dog', emoji: '🐶', label: 'Dog' },
  { type: 'bunny', emoji: '🐰', label: 'Bunny' },
]

const COLORS = ['Cream', 'Mocha', 'Snow']

const RANDOM_NAMES = ['Mochi', 'Luna', 'Coco', 'Biscuit', 'Pudding', 'Maple', 'Tofu', 'Latte']

export default function AdoptPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedPet, setSelectedPet] = useState('cat')
  const [selectedColor, setSelectedColor] = useState('Cream')
  const [petName, setPetName] = useState('Mochi')
  const [loading, setLoading] = useState(false)

  const selectedEmoji = PETS.find(p => p.type === selectedPet)?.emoji ?? '🐱'

  const randomName = () => {
    const name = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]
    setPetName(name)
  }

  const createPet = async () => {
    if (!petName.trim()) return
    setLoading(true)

    try {
      // 先用临时 guest user id（后续接入登录后替换）
      let userId = localStorage.getItem('pawpal_user_id')
      if (!userId) {
        userId = 'guest_' + Math.random().toString(36).slice(2)
        localStorage.setItem('pawpal_user_id', userId)
      }

      const res = await fetch('/api/pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          name: petName.trim(),
          species: selectedPet,
          appearance: selectedColor,
        }),
      })

      const data = await res.json()
      if (data.pet?.id) {
        localStorage.setItem('pawpal_pet_id', data.pet.id)
        router.push('/pet')
      } else {
        // Supabase 未配置时，走 demo 模式
        localStorage.setItem('pawpal_pet_demo', JSON.stringify({
          id: 'demo',
          name: petName.trim(),
          species: selectedPet,
          appearance: selectedColor,
          personality_traits: { energy: 'lazy', attachment: 'clingy', courage: 'brave' },
          intimacy_level: 1,
          mood: 'happy',
          memory_summary: { key_facts: [], recent_topics: [] },
          last_interaction_at: new Date().toISOString(),
        }))
        router.push('/pet')
      }
    } catch {
      // 离线 demo 模式
      localStorage.setItem('pawpal_pet_demo', JSON.stringify({
        id: 'demo',
        name: petName.trim(),
        species: selectedPet,
        appearance: selectedColor,
        personality_traits: { energy: 'lazy', attachment: 'clingy', courage: 'brave' },
        intimacy_level: 1,
        mood: 'happy',
        memory_summary: { key_facts: [], recent_topics: [] },
        last_interaction_at: new Date().toISOString(),
      }))
      router.push('/pet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-8 min-h-screen">
      {/* Topbar */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : router.back()}
          className="w-10 h-10 rounded-full bg-white shadow-md text-lg flex items-center justify-center"
        >←</button>
        <span className="text-sm text-gray-400">Step {step} of 3</span>
      </div>

      {/* Step 1: 选物种 */}
      {step === 1 && (
        <>
          <h2 className="text-2xl font-black mb-4 text-gray-800">Choose your pet</h2>
          <div className="grid grid-cols-3 gap-3">
            {PETS.map(p => (
              <button
                key={p.type}
                onClick={() => setSelectedPet(p.type)}
                className={`flex flex-col items-center p-4 rounded-2xl bg-white/80 shadow-sm border-2 transition-all ${
                  selectedPet === p.type ? 'border-pink-400 scale-105' : 'border-transparent'
                }`}
              >
                <span className="text-4xl mb-2">{p.emoji}</span>
                <span className="font-semibold text-sm">{p.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            className="block w-full mt-6 py-4 rounded-2xl text-white font-black text-lg shadow-lg"
            style={{ background: 'linear-gradient(135deg, #ff6b9d 0%, #ff8f6b 100%)' }}
          >
            Next →
          </button>
        </>
      )}

      {/* Step 2: 选颜色 */}
      {step === 2 && (
        <>
          <h2 className="text-2xl font-black mb-2 text-gray-800">Pick a color vibe</h2>
          <div className="text-5xl text-center my-4">{selectedEmoji}</div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className={`py-3 rounded-2xl bg-white/80 shadow-sm border-2 font-semibold text-sm transition-all ${
                  selectedColor === c ? 'border-pink-400 scale-105' : 'border-transparent'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(3)}
            className="block w-full py-4 rounded-2xl text-white font-black text-lg shadow-lg"
            style={{ background: 'linear-gradient(135deg, #ff6b9d 0%, #ff8f6b 100%)' }}
          >
            Next →
          </button>
        </>
      )}

      {/* Step 3: 起名字 */}
      {step === 3 && (
        <>
          <h2 className="text-2xl font-black mb-2 text-gray-800">Name your companion</h2>
          <div className="text-5xl text-center my-4 animate-bounce">{selectedEmoji}</div>
          <div className="bg-white/85 rounded-2xl p-4 shadow-md">
            <b className="text-gray-700">What&apos;s their name?</b>
            <input
              value={petName}
              onChange={e => setPetName(e.target.value)}
              placeholder="Mochi, Luna, Coco..."
              className="w-full mt-3 px-4 py-3 rounded-2xl bg-pink-50 border-none outline-none text-base"
            />
            <button
              onClick={randomName}
              className="mt-2 text-xs text-pink-400 underline"
            >
              ✨ Random name
            </button>
          </div>
          <button
            onClick={createPet}
            disabled={loading || !petName.trim()}
            className="block w-full mt-5 py-4 rounded-2xl text-white font-black text-lg shadow-lg disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #ff6b9d 0%, #ff8f6b 100%)' }}
          >
            {loading ? 'Creating...' : `Bring ${petName || '...'} Home ✨`}
          </button>
        </>
      )}
    </main>
  )
}
