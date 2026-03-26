import { getWeather, getLocation, tools } from "./tools.js"

const PROXY_URL = import.meta.env.VITE_PROXY_URL || "https://flightapp.jeremie-inkura.workers.dev"

// ─── DOM references ───────────────────────────────────────────────────────────
const welcomeBtn      = document.querySelector(".welcome-btn")
const flyingFromInput = document.querySelector("#flying-from")
const flyingToInput   = document.querySelector("#flying-to")
const dateFromInput   = document.querySelector("#date-from")
const dateToInput     = document.querySelector("#date-to")
const budgetInput     = document.querySelector(".budget")
const form            = document.querySelector(".flying-info")
const foundStartDate  = document.querySelector("#found-start-date")
const foundEndDate    = document.querySelector("#found-end-date")
const foundTrip       = document.querySelector("#found-trip")
const foundActivities = document.querySelector("#found-activities")
const errText         = document.querySelector(".err-txt")
const submitBtn       = document.querySelector(".submit-btn")
const resultsSection  = document.querySelector(".results-section")
const resetBtn        = document.querySelector("#reset-btn")

// ─── Allowed tool functions ───────────────────────────────────────────────────
const allowedFunctions = { getLocation, getWeather }

// ─── Initial state: hide results ─────────────────────────────────────────────
resultsSection.style.display = "none"

// ─── Welcome screen ───────────────────────────────────────────────────────────
welcomeBtn.addEventListener("click", () => {
  document.querySelector(".welcome-page").style.display = "none"
})

// ─── Reset / New Search ───────────────────────────────────────────────────────
resetBtn.addEventListener("click", () => {
  form.reset()
  errText.textContent         = ""
  foundTrip.textContent       = ""
  foundStartDate.textContent  = ""
  foundEndDate.textContent    = ""
  foundActivities.innerHTML   = ""
  resultsSection.style.display = "none"
  // Scroll back up to the form smoothly
  form.scrollIntoView({ behavior: "smooth" })
})

// ─── Form submit ──────────────────────────────────────────────────────────────
form.addEventListener("submit", async (e) => {
  e.preventDefault()
  errText.textContent = ""

  const from   = flyingFromInput.value.trim()
  const to     = flyingToInput.value.trim()
  const dFrom  = dateFromInput.value
  const dTo    = dateToInput.value
  const budget = budgetInput.value || "any"

  if (!from || !to) {
    errText.textContent = "Please enter both locations for your trip."
    return
  }
  if (!dFrom || !dTo) {
    errText.textContent = "Please enter both dates for your trip."
    return
  }
  if (dTo < dFrom) {
    errText.textContent = "End date cannot be before start date."
    return
  }

  setLoading(true)
  resultsSection.style.display = "block"

  try {
    const result = await agent(
      `Find the weather in ${to} from ${dFrom} to ${dTo} and suggest three activities within a ${budget} euro budget.`
    )
    foundStartDate.textContent = dFrom
    foundEndDate.textContent   = dTo
    foundTrip.textContent      = `${from} → ${to}`
    // Use innerHTML so bullet points and line breaks from the AI render properly
    foundActivities.innerHTML  = formatActivities(result)
    foundActivities.classList.remove("loading")
  } catch (err) {
    console.error(err)
    errText.textContent = "Something went wrong while planning your trip. Please try again."
    resultsSection.style.display = "none"
  } finally {
    setLoading(false)
  }
})

// ─── Format AI response: convert markdown-style bullets to HTML ───────────────
function formatActivities(text) {
  return text
    // Bold: **text** → <strong>text</strong>
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Bullet lines starting with - or • or numbers like 1.
    .replace(/^[-•]\s+(.+)$/gm, "<li>$1</li>")
    .replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>")
    // Wrap consecutive <li> items in a <ul>
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    // Remaining newlines become line breaks
    .replace(/\n{2,}/g, "<br><br>")
    .replace(/\n/g, "<br>")
}

// ─── Agent loop ───────────────────────────────────────────────────────────────
export async function agent(query) {
  const messages = [
    {
      role: "system",
      content:
        "You are a flight assistant. Always use the provided functions when relevant. Never guess coordinates or weather. Keep answers concise with bullet points.",
    },
    { role: "user", content: query },
  ]

  for (let i = 0; i < 10; i++) {
    const response = await callProxy({ model: "gpt-4o-mini", messages, tools })
    const message  = response.choices[0].message
    messages.push(message)

    if (message.tool_calls?.length > 0) {
      for (const toolCall of message.tool_calls) {
        const fn     = allowedFunctions[toolCall.function.name]
        const args   = JSON.parse(toolCall.function.arguments)
        const result = fn ? await fn(args.location) : null
        messages.push({
          role:         "tool",
          tool_call_id: toolCall.id,
          content:      JSON.stringify(result),
        })
      }
    } else {
      return message.content
    }
  }

  throw new Error("Agent did not converge after maximum iterations.")
}

// ─── Proxy fetch ──────────────────────────────────────────────────────────────
async function callProxy(payload) {
  const res = await fetch(PROXY_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Proxy error ${res.status}: ${text}`)
  }
  return res.json()
}

// ─── UI helpers ───────────────────────────────────────────────────────────────
function setLoading(loading) {
  submitBtn.disabled    = loading
  submitBtn.textContent = loading ? "Planning..." : "Plan my Trip"
  if (loading) {
    foundActivities.innerHTML  = "Fetching weather & planning activities..."
    foundActivities.classList.add("loading")
  }
}