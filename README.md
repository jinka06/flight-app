# ✈️ Fly Around — Weather & Activity Planner

A lightweight flight assistant that helps you plan your trip by fetching real weather forecasts for your destination and suggesting tailored activities based on the expected conditions and your budget.

---

## 🎯 Purpose

Enter your departure city, destination, travel dates, and budget — and the app will:

1. Retrieve the geographical coordinates of your destination
2. Fetch a real weather forecast for your travel period
3. Use an AI agent (GPT-4o mini) to suggest three relevant activities based on the weather and budget

---

## 🛠️ Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JS (ES Modules), HTML5, CSS3 |
| Build tool | [Vite](https://vitejs.dev/) |
| AI | [OpenAI GPT-4o mini](https://platform.openai.com/docs/) via function/tool calling |
| Weather API | [Open-Meteo](https://open-meteo.com/) (free, no key required) |
| Geocoding | [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) |
| API proxy | [Cloudflare Workers](https://workers.cloudflare.com/) (keeps the OpenAI key server-side) |
| Hosting | [GitHub Pages](https://pages.github.com/) |

---

## 🔒 Security

The OpenAI API key is **never exposed in the frontend bundle**. All calls to OpenAI are routed through a Cloudflare Worker proxy that injects the key server-side. The key is stored as an encrypted Cloudflare Worker secret and never committed to this repository.

---

## ⚠️ Known Limitations

- **Weather forecast range:** Open-Meteo provides forecasts for up to **7 days** from today. If your travel dates are beyond that window, the weather data returned will be incomplete or unavailable, and the AI will note this.
- **No flight search:** Despite the name, the app does not search for flights or prices. It focuses on destination weather and activity planning.
- **Budget is indicative:** The budget parameter is passed as context to the AI — it informs the suggestions but is not enforced programmatically.
- **Single destination:** The app plans for one destination at a time. Multi-leg trips are not supported yet.
- **English only:** The AI responses and geocoding are in English regardless of the user's browser language.

---