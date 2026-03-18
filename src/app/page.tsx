'use client'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="max-w-md mx-auto px-4 py-8 min-h-screen">
      {/* Tag */}
      <span className="inline-block px-3 py-2 rounded-full bg-white text-pink-500 text-xs font-bold shadow-md">
        🐾 AI Pet Companion
      </span>

      {/* Hero Title */}
      <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-gray-800">
        Your AI pet<br />already misses you.
      </h1>
      <p className="mt-3 text-base text-gray-500 leading-relaxed">
        Adopt a tiny companion with real personality and memory. It remembers your mood, your name, and that weird little thing you said yesterday.
      </p>

      {/* Hero Card */}
      <div className="mt-6 relative bg-gradient-to-br from-white to-pink-50 rounded-3xl p-6 shadow-xl text-center overflow-hidden">
        <div className="absolute top-4 left-4 bg-white rounded-2xl px-3 py-2 text-xs text-gray-500 shadow-md">
          I saved your seat... meow 💗
        </div>
        <div className="text-8xl animate-bounce py-4">🐱</div>
        <div className="absolute bottom-4 right-4 bg-white rounded-2xl px-3 py-2 text-xs text-gray-500 shadow-md">
          You had coffee again, right?
        </div>
      </div>

      {/* CTA */}
      <Link href="/adopt"
        className="block w-full mt-5 py-4 rounded-2xl text-white text-center font-black text-lg shadow-lg"
        style={{ background: 'linear-gradient(135deg, #ff6b9d 0%, #ff8f6b 100%)' }}
      >
        Adopt for Free 🐾
      </Link>

      {/* Features */}
      <div className="mt-5 grid gap-3">
        {[
          { icon: '🧠', title: 'Real Memory', desc: 'Your pet remembers your stories and brings them up naturally.' },
          { icon: '💕', title: 'Unique Personality', desc: 'Lazy, clingy, brave, shy — every pet feels a little different.' },
          { icon: '🌙', title: 'Always Here', desc: 'No walks, no litter box, just soft little companionship.' },
        ].map(f => (
          <div key={f.title} className="bg-white/80 rounded-2xl p-4 shadow-sm">
            <b className="block mb-1">{f.icon} {f.title}</b>
            <span className="text-sm text-gray-500">{f.desc}</span>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-6 bg-white/60 rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold mb-3 text-gray-700">FAQ</h3>
        {[
          { q: 'What is an AI pet?', a: 'A virtual companion powered by AI that chats with you, remembers your conversations, and has its own personality.' },
          { q: 'Is it free?', a: 'Yes! Adopt for free and get 30 messages per day.' },
          { q: 'Is my data safe?', a: 'Your conversations are stored securely and never shared.' },
        ].map(item => (
          <div key={item.q} className="mb-3">
            <p className="font-semibold text-sm text-gray-700">{item.q}</p>
            <p className="text-sm text-gray-500 mt-1">{item.a}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
