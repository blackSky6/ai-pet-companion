/**
 * Cloudflare Pages Function: /api/pet
 * 宠物 CRUD — 通过 Supabase REST API 操作
 */

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS })
}

function getSupabase(env) {
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    key: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
}

async function supabaseRequest(env, path, method = 'GET', body = null, params = '') {
  const { url, key } = getSupabase(env)
  const res = await fetch(`${url}/rest/v1/${path}${params}`, {
    method,
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : 'return=representation',
    },
    body: body ? JSON.stringify(body) : null,
  })
  const data = await res.json()
  return { data, ok: res.ok, status: res.status }
}

function randomPersonality() {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
  return {
    energy: pick(['active', 'lazy']),
    attachment: pick(['clingy', 'independent']),
    courage: pick(['brave', 'shy']),
  }
}

// GET /api/pet?user_id=xxx
export async function onRequestGet(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const userId = url.searchParams.get('user_id')

  if (!userId) return json({ error: 'Missing user_id' }, 400)

  const { data } = await supabaseRequest(
    env, 'pets', 'GET', null,
    `?user_id=eq.${encodeURIComponent(userId)}&limit=1`
  )

  const pet = Array.isArray(data) ? data[0] : null
  return json({ pet: pet || null })
}

// POST /api/pet — 创建宠物
export async function onRequestPost(context) {
  const { request, env } = context
  try {
    const { user_id, name, species, appearance } = await request.json()
    if (!user_id || !name || !species) return json({ error: 'Missing required fields' }, 400)

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

    const { data, ok } = await supabaseRequest(env, 'pets', 'POST', newPet)
    if (!ok) return json({ error: 'Failed to create pet' }, 500)
    const pet = Array.isArray(data) ? data[0] : data
    return json({ pet })
  } catch (e) {
    return json({ error: 'Internal error: ' + e.message }, 500)
  }
}

// PATCH /api/pet — 更新宠物
export async function onRequestPatch(context) {
  const { request, env } = context
  try {
    const { pet_id, updates } = await request.json()
    if (!pet_id) return json({ error: 'Missing pet_id' }, 400)

    const { data, ok } = await supabaseRequest(
      env, 'pets', 'PATCH',
      { ...updates, last_interaction_at: new Date().toISOString() },
      `?id=eq.${encodeURIComponent(pet_id)}`
    )
    if (!ok) return json({ error: 'Failed to update pet' }, 500)
    const pet = Array.isArray(data) ? data[0] : data
    return json({ pet })
  } catch (e) {
    return json({ error: 'Internal error: ' + e.message }, 500)
  }
}

// OPTIONS 预检
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS })
}
