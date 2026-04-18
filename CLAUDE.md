# Commodity Intelligence Tracker

A Node.js/Express API that accepts a commodity name (chemical, solvent, API, etc.) and location, then returns price analytics and market intelligence.

## Project Structure

```
commodity-intelligence-tracker/
├── src/
│   ├── index.js        # Express server, route definitions
│   ├── fetcher.js      # Fetch raw price data from sources (Axios)
│   ├── analyzer.js     # Compute median, avg, min, trends, market dynamics
│   └── formatter.js    # Shape final JSON response
├── .env                # API keys (not committed)
├── .env.example        # Template for required env vars
├── package.json
└── CLAUDE.md
```

## Commands

```bash
npm install             # Install dependencies
npm start               # Start server (port 3000)
npm run dev             # Start with nodemon (auto-reload)
```

## API

### POST /api/commodity
Request body:
```json
{ "commodity": "acetone", "location": "India" }
```

Response:
```json
{
  "commodity": "acetone",
  "location": "India",
  "currency": "USD",
  "unit": "per kg",
  "prices": {
    "median": 0.85,
    "average": 0.87,
    "min": 0.72,
    "max": 1.10
  },
  "trend": { "direction": "rising", "changePercent": 4.2, "period": "30d" },
  "marketDynamics": { "supplyOutlook": "tight", "demandDrivers": [...], "risks": [...] },
  "keySuppliers": [{ "name": "...", "country": "...", "marketShare": "..." }],
  "lastUpdated": "2026-04-18T00:00:00Z"
}
```

## Architecture

- **fetcher.js** — calls external price APIs (ICIS, ChemAnalyst, fallback to web scraping via Axios). Normalizes raw data into `{ source, priceUSD, unit, date }` objects.
- **analyzer.js** — takes normalized price array, computes stats and trends. Pure functions, no I/O.
- **formatter.js** — takes analyzed data + supplier info and builds the final API response shape.
- **index.js** — wires Express routes to fetcher → analyzer → formatter pipeline.

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default 3000) |
| `CHEMANALYST_API_KEY` | ChemAnalyst API key |
| `SERPAPI_KEY` | SerpAPI key for fallback web search |
| `OPENAI_API_KEY` | Optional: GPT for market dynamics summarization |

## Data Sources (priority order)
1. ChemAnalyst API
2. ICIS pricing feed
3. SerpAPI web search fallback
4. Static seed data (for offline/dev)
