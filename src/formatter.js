// Static supplier reference — extend or replace with a live API as needed
const SUPPLIER_DB = {
  acetone: [
    { name: 'Deepak Fertilisers', country: 'India', marketShare: '~18%' },
    { name: 'INEOS Phenol', country: 'Germany', marketShare: '~14%' },
    { name: 'LG Chem', country: 'South Korea', marketShare: '~11%' },
  ],
  ethanol: [
    { name: 'Cristal Union', country: 'France', marketShare: '~12%' },
    { name: 'Greenfield Global', country: 'Canada', marketShare: '~10%' },
    { name: 'Praj Industries', country: 'India', marketShare: '~8%' },
  ],
  methanol: [
    { name: 'Methanex', country: 'Canada', marketShare: '~14%' },
    { name: 'OCI N.V.', country: 'Netherlands', marketShare: '~9%' },
    { name: 'SABIC', country: 'Saudi Arabia', marketShare: '~8%' },
  ],
};

const DEFAULT_SUPPLIERS = [
  { name: 'Multiple regional traders', country: 'Various', marketShare: 'N/A' },
];

function getSuppliers(commodity) {
  return SUPPLIER_DB[commodity.toLowerCase()] || DEFAULT_SUPPLIERS;
}

function format(commodity, location, stats, trend, marketDynamics, dataSource) {
  return {
    commodity,
    location,
    currency: 'USD',
    unit: 'per kg',
    prices: stats,
    trend,
    marketDynamics,
    keySuppliers: getSuppliers(commodity),
    dataSource,
    lastUpdated: new Date().toISOString(),
  };
}

module.exports = { format };
