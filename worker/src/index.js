/**
 * Cloudflare Worker — OpenAI proxy
 * Keeps the API key server-side, away from the browser bundle.
 *
 * Deploy steps (run from /worker):
 *   npm install -g wrangler
 *   wrangler login
 *   wrangler secret put OPENAI_API_KEY   ← paste your key when prompted
 *   wrangler deploy
 */

const ALLOWED_ORIGIN = "https://jinka06.github.io"

function corsHeaders(origin) {
  const allowed = origin === ALLOWED_ORIGIN || origin === "http://localhost:5173"
  return {
    "Access-Control-Allow-Origin": allowed ? origin : ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || ""

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return new Response("Invalid JSON", { status: 400 })
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    })

    const data = await openaiRes.json()

    return new Response(JSON.stringify(data), {
      status: openaiRes.status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(origin),
      },
    })
  },
}