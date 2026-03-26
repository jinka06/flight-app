export async function getLocation(location) {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
    )
    const data = await res.json()
    if (!data.results?.length) return null
    const { name, latitude: lat, longitude: lon } = data.results[0]
    return { name, lat, lon }
  } catch (err) {
    console.error("Location error:", err)
    return null
  }
}

export async function getWeather(location) {
  try {
    const loc = await getLocation(location)
    if (!loc) return null
    const { lat, lon, name } = loc
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_min,temperature_2m_max,precipitation_hours&timezone=auto`
    )
    const data = await res.json()
    return { name, daily: data.daily }
  } catch (err) {
    console.error("Weather error:", err)
    return null
  }
}

// Modern OpenAI "tools" format (replaces deprecated "functions")
export const tools = [
  {
    type: "function",
    function: {
      name: "getLocation",
      description: "Get coordinates for a given city name",
      parameters: {
        type: "object",
        properties: { location: { type: "string" } },
        required: ["location"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getWeather",
      description: "Get weather forecast for a location",
      parameters: {
        type: "object",
        properties: { location: { type: "string" } },
        required: ["location"],
      },
    },
  },
]