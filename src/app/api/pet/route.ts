import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomPersonality } from '@/lib/pet-prompt'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/pet?user_id=xxx — 获取宠物
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id')
  if (!userId) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) return NextResponse.json({ pet: null })
  return NextResponse.json({ pet: data })
}

// POST /api/pet — 创建宠物
export async function POST(req: NextRequest) {
  try {
    const { user_id, name, species, appearance } = await req.json()

    if (!user_id || !name || !species) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newPet = {
      user_id,
      name,
      species,
      appearance: appearance || 'Cream',
      personality_traits: randomPersonality(),
      intimacy_level: 1,
      mood: 'happy',
      memory_summary: { key_facts: [], recent_topics: [] },
      last_interaction_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('pets')
      .insert(newPet)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ pet: data })
  } catch (e) {
    console.error('Pet API error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/pet — 更新宠物状态/记忆
export async function PATCH(req: NextRequest) {
  try {
    const { pet_id, updates } = await req.json()
    if (!pet_id) return NextResponse.json({ error: 'Missing pet_id' }, { status: 400 })

    const { data, error } = await supabase
      .from('pets')
      .update({ ...updates, last_interaction_at: new Date().toISOString() })
      .eq('id', pet_id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ pet: data })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
