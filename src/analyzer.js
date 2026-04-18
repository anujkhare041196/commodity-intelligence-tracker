// All functions are pure — no I/O, no side effects.

function median(sorted) {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function computePriceStats(prices) {
  if (prices.length === 0) return null;

  const values = prices.map((p) => p.priceUSD).sort((a, b) => a - b);
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;

  return {
    median: parseFloat(median(values).toFixed(4)),
    average: parseFloat(avg.toFixed(4)),
    min: parseFloat(values[0].toFixed(4)),
    max: parseFloat(values[values.length - 1].toFixed(4)),
  };
}

function computeTrend(prices) {
  if (prices.length < 2) return { direction: 'insufficient data', changePercent: 0, period: '30d' };

  // Sort ascending by date
  const sorted = [...prices].sort((a, b) => new Date(a.date) - new Date(b.date));
  const oldest = sorted[0].priceUSD;
  const newest = sorted[sorted.length - 1].priceUSD;
  const changePercent = parseFloat((((newest - oldest) / oldest) * 100).toFixed(2));

  let direction = 'stable';
  if (changePercent > 1) direction = 'rising';
  else if (changePercent < -1) direction = 'falling';

  return { direction, changePercent, period: '30d' };
}

// Derive qualitative market signals from price stats and trend
function computeMarketDynamics(commodity, location, stats, trend) {
  const supplyOutlook =
    trend.direction === 'rising' ? 'tight' :
    trend.direction === 'falling' ? 'ample' : 'balanced';

  const demandDrivers = buildDemandDrivers(commodity);
  const risks = buildRisks(trend, stats);

  return { supplyOutlook, demandDrivers, risks };
}

function buildDemandDrivers(commodity) {
  const name = commodity.toLowerCase();
  const base = ['Industrial manufacturing', 'Export demand'];

  if (['acetone', 'ethanol', 'methanol', 'ipa', 'isopropanol'].includes(name)) {
    return [...base, 'Pharmaceutical sector', 'Cosmetics & personal care', 'Agrochemical formulation'];
  }
  if (['benzene', 'toluene', 'xylene'].includes(name)) {
    return [...base, 'Petrochemical derivatives', 'Polymer production'];
  }
  return [...base, 'Chemical synthesis', 'Specialty applications'];
}

function buildRisks(trend, stats) {
  const risks = ['Feedstock price volatility', 'Regulatory/environmental compliance'];
  const spread = stats.max - stats.min;

  if (trend.direction === 'rising') risks.push('Supply chain tightness');
  if (spread / stats.average > 0.3) risks.push('High price dispersion across suppliers');
  if (trend.changePercent > 10) risks.push('Rapid cost escalation risk');

  return risks;
}

function analyze(commodity, location, prices) {
  const stats = computePriceStats(prices);
  const trend = computeTrend(prices);
  const marketDynamics = computeMarketDynamics(commodity, location, stats, trend);

  return { stats, trend, marketDynamics };
}

module.exports = { analyze };
