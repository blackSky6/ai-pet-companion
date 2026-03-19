/**
 * Cloudflare Pages Function: /api/chat
 * 代理 AI 请求，保护 API Key
 */
export async function onRequestPost(context) {
  const { request, env } = context

  try {
    const body = await request.json()
    const { messages, max_tokens = 500, temperature = 0.9 } = body

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 按优先级尝试多个免费模型，避免单点限流
    const MODELS = [
      'stepfun/step-3.5-flash:free',
      'arcee-ai/trinity-large-preview:free',
      'arcee-ai/trinity-mini:free',
      'openai/gpt-oss-20b:free',
    ]

    let res, data
    for (const model of MODELS) {
      res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ai-pet-companion.pages.dev',
          'X-Title': 'PawPal AI Pet',
        },
        body: JSON.stringify({ model, messages, max_tokens, temperature }),
      })
      data = await res.json()
      // 429 或无 choices 则尝试下一个模型
      if (data.choices?.[0]?.message !== undefined) break
    }

    // 修复思维链模型 content 为 null 的情况
    if (data.choices?.[0]?.message) {
      const msg = data.choices[0].message
      if (!msg.content && msg.reasoning) {
        const lines = msg.reasoning.split('\n').filter(Boolean)
        const lastLine = lines[lines.length - 1] || ''
        const quoted = lastLine.match(/["']([^"']{5,})["']/)
        msg.content = quoted
          ? quoted[1]
          : lastLine.replace(/^(So|Thus|Reply:|Answer:)\s*/i, '').trim()
      }
    }

    // 只返回前端需要的内容，屏蔽模型、id、usage 等敏感信息
    const safeResponse = {
      choices: data.choices?.map(choice => ({
        message: {
          role: choice.message?.role,
          content: choice.message?.content,
        },
        finish_reason: choice.finish_reason,
        index: choice.index,
      })),
    }

    return new Response(JSON.stringify(safeResponse), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal error: ' + e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// OPTIONS 预检
export async function onRequestOptions() {
  return new Response(null, { status: 204 })
}
