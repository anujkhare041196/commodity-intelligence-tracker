require('dotenv').config();
const express = require('express');
const { fetchPrices } = require('./fetcher');
const { analyze } = require('./analyzer');
const { format } = require('./formatter');

const app = express();
app.use(express.json());

app.post('/api/commodity', async (req, res) => {
  const { commodity, location } = req.body;

  if (!commodity || !location) {
    return res.status(400).json({ error: 'Both "commodity" and "location" are required.' });
  }

  try {
    const prices = await fetchPrices(commodity, location);

    if (prices.length === 0) {
      return res.status(404).json({
        error: 'No price data found for the given commodity and location.',
        commodity,
        location,
      });
    }

    const { stats, trend, marketDynamics } = analyze(commodity, location, prices);
    const sources = [...new Set(prices.map((p) => p.source))];
    const response = format(commodity, location, stats, trend, marketDynamics, sources);

    return res.json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Commodity tracker running on port ${PORT}`));
