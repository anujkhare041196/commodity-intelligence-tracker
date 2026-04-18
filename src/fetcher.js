const axios = require('axios');

// Seed data for dev/offline use when no API keys are configured
const SEED_DATA = {
  acetone: [
    { source: 'seed', priceUSD: 0.72, unit: 'per kg', date: '2026-03-01' },
    { source: 'seed', priceUSD: 0.85, unit: 'per kg', date: '2026-03-15' },
    { source: 'seed', priceUSD: 0.91, unit: 'per kg', date: '2026-04-01' },
    { source: 'seed', priceUSD: 1.10, unit: 'per kg', date: '2026-04-15' },
  ],
  ethanol: [
    { source: 'seed', priceUSD: 0.55, unit: 'per kg', date: '2026-03-01' },
    { source: 'seed', priceUSD: 0.60, unit: 'per kg', date: '2026-03-15' },
    { source: 'seed', priceUSD: 0.58, unit: 'per kg', date: '2026-04-01' },
    { source: 'seed', priceUSD: 0.63, unit: 'per kg', date: '2026-04-15' },
  ],
  methanol: [
    { source: 'seed', priceUSD: 0.38, unit: 'per kg', date: '2026-03-01' },
    { source: 'seed', priceUSD: 0.41, unit: 'per kg', date: '2026-03-15' },
    { source: 'seed', priceUSD: 0.44, unit: 'per kg', date: '2026-04-01' },
    { source: 'seed', priceUSD: 0.43, unit: 'per kg', date: '2026-04-15' },
  ],
};

// Normalize a price entry to standard shape
function normalize(source, priceUSD, date) {
  return { source, priceUSD: parseFloat(priceUSD), unit: 'per kg', date };
}

async function fetchFromChemAnalyst(commodity, location) {
  const key = process.env.CHEMANALYST_API_KEY;
  if (!key) return [];

  try {
    const res = await axios.get('https://api.chemanalyst.com/v1/prices', {
      params: { commodity, location, period: '30d' },
      headers: { Authorization: `Bearer ${key}` },
      timeout: 8000,
    });
    return (res.data.prices || []).map((p) =>
      normalize('chemanalyst', p.price_usd_per_kg, p.date)
    );
  } catch {
    return [];
  }
}

async function fetchFromSerpApi(commodity, location) {
  const key = process.env.SERPAPI_KEY;
  if (!key) return [];

  try {
    const query = `${commodity} price per kg ${location} 2026`;
    const res = await axios.get('https://serpapi.com/search', {
      params: { q: query, api_key: key, engine: 'google', num: 5 },
      timeout: 8000,
    });

    const prices = [];
    const priceRegex = /USD?\s*(\d+(?:\.\d+)?)\s*(?:\/\s*kg|per\s*kg)/gi;
    const snippets = (res.data.organic_results || []).map((r) => r.snippet).join(' ');
    let match;
    while ((match = priceRegex.exec(snippets)) !== null) {
      prices.push(normalize('serpapi', match[1], new Date().toISOString().slice(0, 10)));
    }
    return prices;
  } catch {
    return [];
  }
}

function fetchFromSeed(commodity) {
  const key = commodity.toLowerCase();
  return SEED_DATA[key] || [];
}

async function fetchPrices(commodity, location) {
  const [chemAnalystPrices, serpPrices] = await Promise.all([
    fetchFromChemAnalyst(commodity, location),
    fetchFromSerpApi(commodity, location),
  ]);

  const combined = [...chemAnalystPrices, ...serpPrices];

  // Fall back to seed data when live sources return nothing
  if (combined.length === 0) {
    return fetchFromSeed(commodity);
  }

  return combined;
}

module.exports = { fetchPrices };
