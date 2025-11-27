
import { ClientSummary, CommissionDetail, MetricData, SettlementReport, WalletItem, CashFlowMetrics, CashFlowTransaction, TransactionType, CashFlowStatus, PositionMetrics, OpenPosition } from './types';

export const TRADING_SYMBOLS = ['All', 'EURUSD', 'GBPUSD', 'XAUUSD', 'BTCUSD', 'US30'];

export const MOCK_METRICS: MetricData = {
  totalCommission: 125430.50,
  historicalTotal: 1542000.00,
  settledAmount: 98450.25,
  directSettled: 45000.00,
  agentSettled: 53450.25,
  pendingAmount: 26980.25,
  totalLots: 4502.5,
  activeClients: 142
};

export const MOCK_CASH_FLOW_METRICS: CashFlowMetrics = {
  totalInflow: 2500000.00,
  totalOutflow: 1200000.00,
  totalInternalTransfer: 300000.00,
  netCashFlow: 1300000.00 
};

// --- Mock Position Metrics ---
export const MOCK_POSITIONS_METRICS: PositionMetrics = {
  totalOpenLots: 1500,
  totalFloatingPL: -12000.50,
  avgHoldingTime: "14h 32m"
};

export const MOCK_WALLETS_TOTAL: WalletItem[] = [
  { currency: 'USD', amount: 45230.50, color: 'bg-blue-100 text-blue-600' },
  { currency: 'USDT', amount: 78200.00, color: 'bg-emerald-100 text-emerald-600' },
  { currency: 'EUR', amount: 1500.00, color: 'bg-indigo-100 text-indigo-600' },
  { currency: 'BTC', amount: 4500.00, displayAmount: '0.065 BTC', color: 'bg-orange-100 text-orange-600' },
];

export const MOCK_WALLETS_SETTLED: WalletItem[] = [
  { currency: 'USD', amount: 35000.00, color: 'bg-blue-100 text-blue-600' },
  { currency: 'USDT', amount: 60000.00, color: 'bg-emerald-100 text-emerald-600' },
  { currency: 'EUR', amount: 1000.00, color: 'bg-indigo-100 text-indigo-600' },
  { currency: 'BTC', amount: 2450.25, displayAmount: '0.035 BTC', color: 'bg-orange-100 text-orange-600' },
];

export const MOCK_WALLETS_PENDING: WalletItem[] = [
  { currency: 'USD', amount: 10230.50, color: 'bg-blue-100 text-blue-600' },
  { currency: 'USDT', amount: 18200.00, color: 'bg-emerald-100 text-emerald-600' },
  { currency: 'EUR', amount: 500.00, color: 'bg-indigo-100 text-indigo-600' },
  { currency: 'BTC', amount: 2049.75, displayAmount: '0.030 BTC', color: 'bg-orange-100 text-orange-600' },
];

export const MOCK_CLIENTS: ClientSummary[] = Array.from({ length: 30 }).map((_, i) => {
  const isAgent = i % 3 === 0;
  const contribution = Math.floor(Math.random() * 5000) + 100;
  const totalCommission = MOCK_METRICS.totalCommission;
  
  return {
    clientId: `C-${2000 + i}`,
    clientName: isAgent ? `Li Si ${i}` : `Zhang San ${i}`,
    identity: (isAgent ? 'Agent' : 'Direct') as 'Agent' | 'Direct',
    relatedInfo: isAgent && i % 2 === 0 ? `Order No. 3223${40 + i}` : undefined,
    tradingVolume: Number((Math.random() * 500 + 10).toFixed(2)),
    netProfitLoss: Number(((Math.random() * 4000) - 1000).toFixed(2)),
    contributedCommission: contribution,
    commissionPercentage: Number(((contribution / totalCommission) * 100).toFixed(2))
  };
}).sort((a, b) => b.contributedCommission - a.contributedCommission);

export const MOCK_SETTLEMENTS: SettlementReport[] = Array.from({ length: 20 }).map((_, i) => {
  const isPending = i % 5 === 0;
  const currencies = ['USD', 'USDT', 'EUR', 'BTC'];
  const currency = currencies[i % currencies.length];
  const originalAmount = Math.floor(Math.random() * 1000) + 50;
  
  let estAmount = originalAmount;
  if (currency === 'EUR') estAmount = originalAmount * 1.08;
  if (currency === 'BTC') estAmount = originalAmount * 65000;
  if (currency === 'USDT') estAmount = originalAmount * 1;

  const directPct = Math.floor(Math.random() * 90) + 10;
  const agentPct = 100 - directPct;

  return {
    id: `S-${20230000 + i}`,
    settlementNo: `S${20230000 + i}`,
    cycle: isPending ? '' : `2023-10-${10 + i}~2023-10-${17 + i}`,
    amount: estAmount,
    originalAmount: originalAmount,
    sourceType: i % 2 === 0 ? 'Direct' : 'Agent',
    currency: currency,
    sourceComposition: `Direct (${directPct}%) / Agent (${agentPct}%)`,
    rebateAccount: `MT4-${88000 + i}`,
    txCount: Math.floor(Math.random() * 50) + 1,
    status: isPending ? 'Pending' : 'Settled',
    settleDate: isPending ? null : `2023-10-${18 + i} 14:30:00`
  };
});

export const MOCK_CASH_FLOW_DATA: CashFlowTransaction[] = Array.from({ length: 40 }).map((_, i) => {
  const types = [TransactionType.DEPOSIT, TransactionType.WITHDRAWAL, TransactionType.TRANSFER];
  const statuses = [CashFlowStatus.SUCCESS, CashFlowStatus.PENDING, CashFlowStatus.FAILED];
  
  const type = types[i % 3];
  let status = statuses[0];
  if (i % 5 === 0) status = statuses[1];
  if (i % 13 === 0) status = statuses[2];

  const isAgent = i % 4 === 0;

  return {
    id: `CF-${1000 + i}`,
    transactionNo: `TXN${900000 + i}`,
    sourceType: (isAgent ? 'Agent' : 'Direct') as 'Direct' | 'Agent',
    clientName: isAgent ? `Agent User ${i}` : `Client User ${i}`,
    accountId: `MT4-${10000 + i}`,
    type: type,
    amount: Number((Math.random() * 5000 + 100).toFixed(2)),
    status: status,
    submitTime: `2023-11-${String(1 + (i % 28)).padStart(2, '0')} 09:30:00`,
    completeTime: status === CashFlowStatus.SUCCESS || status === CashFlowStatus.FAILED 
      ? `2023-11-${String(1 + (i % 28)).padStart(2, '0')} 10:15:00` 
      : null
  };
});

// --- Mock Open Positions ---
export const MOCK_OPEN_POSITIONS: OpenPosition[] = Array.from({ length: 25 }).map((_, i) => {
  const isAgent = i % 3 === 0;
  const isSubAgentClient = isAgent && i % 2 === 0;
  const direction = i % 2 === 0 ? 'Buy' : 'Sell';
  const symbol = TRADING_SYMBOLS[1 + (i % 5)];
  const openPrice = symbol === 'XAUUSD' ? 2000 : symbol === 'BTCUSD' ? 65000 : 1.05;
  const currentPrice = direction === 'Buy' ? openPrice * 1.01 : openPrice * 0.99; // Assume generic profit
  
  return {
    id: `POS-${5000 + i}`,
    sourceType: (isAgent ? 'Agent' : 'Direct') as 'Direct' | 'Agent',
    clientName: isAgent ? `Li Si ${i}` : `Zhang San ${i}`,
    relatedMemberId: isSubAgentClient ? `3223${i}${i}44` : undefined,
    accountId: `MT4-${88800 + i}`,
    openTime: `2023-11-${String(20 - (i % 10)).padStart(2, '0')} 08:30:00`,
    symbol: symbol,
    direction: direction as 'Buy' | 'Sell',
    lots: Number((Math.random() * 5 + 0.1).toFixed(2)),
    openPrice: Number(openPrice.toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2)),
    currentPrice: Number(currentPrice.toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2)),
    floatingPL: Number(((Math.random() * 1000) - 300).toFixed(2)),
    swap: Number(((Math.random() * 10) - 5).toFixed(2)),
    comment: i % 5 === 0 ? 'EA Trade' : ''
  };
}).sort((a, b) => new Date(b.openTime).getTime() - new Date(a.openTime).getTime());

export const MOCK_DETAILS: CommissionDetail[] = Array.from({ length: 50 }).map((_, i) => {
  const isAgent = i % 3 === 0;
  const type = isAgent ? 'Agent' : 'Direct';
  const name = isAgent ? `Li Si ${i}` : `Zhang San ${i}`;
  const extraInfo = isAgent && i % 2 === 0 ? `(3223${40 + i})` : '';

  return {
    id: `TRX-${i}`,
    orderId: `ORD-${8000 + i}`,
    source: `${type}: ${name}${extraInfo ? ' ' + extraInfo : ''}`,
    account: `MT4-${5000 + i}`,
    symbol: TRADING_SYMBOLS[1 + (i % 5)],
    direction: (i % 2 === 0 ? 'Buy' : 'Sell') as 'Buy' | 'Sell',
    lots: Number((Math.random() * 5).toFixed(2)),
    rate: 10,
    amount: Number((Math.random() * 50).toFixed(2)),
    status: i % 10 === 0 ? 'Pending' : 'Settled',
    openTime: `2023-11-${String(1 + (i % 28)).padStart(2, '0')} 10:00:00`,
    holdTime: '2h 30m',
    closeTime: `2023-11-${String(1 + (i % 28)).padStart(2, '0')} 12:30:00`,
    settleTime: `2023-11-${String(2 + (i % 28)).padStart(2, '0')} 02:00:00`
  };
});

export const CHART_TREND_DATA = [
  { date: 'Mon', value: 4000 },
  { date: 'Tue', value: 3000 },
  { date: 'Wed', value: 2000 },
  { date: 'Thu', value: 2780 },
  { date: 'Fri', value: 1890 },
  { date: 'Sat', value: 2390 },
  { date: 'Sun', value: 3490 },
];

export const CHART_SYMBOL_DATA = [
  { name: 'XAUUSD', value: 400 },
  { name: 'EURUSD', value: 300 },
  { name: 'GBPUSD', value: 300 },
  { name: 'BTCUSD', value: 200 },
];

export const CHART_CASH_FLOW_TREND = [
  { date: 'Mon', value: 12000 },
  { date: 'Tue', value: 8500 },
  { date: 'Wed', value: -3000 },
  { date: 'Thu', value: 5000 },
  { date: 'Fri', value: 15000 },
  { date: 'Sat', value: -1200 },
  { date: 'Sun', value: 4000 },
];

export const CHART_STATUS_DISTRIBUTION = [
  { name: 'Success', value: 850 },
  { name: 'Pending', value: 120 },
  { name: 'Failed', value: 30 },
];

// --- Chart Data for Positions ---
export const CHART_POSITIONS_PL_BY_SYMBOL = [
  { name: 'XAUUSD', value: 4500 },
  { name: 'EURUSD', value: 2100 },
  { name: 'GBPUSD', value: -1200 },
  { name: 'US30', value: 800 },
  { name: 'BTCUSD', value: -3500 },
];

export const CHART_POSITIONS_NET_EXPOSURE = [
  { name: 'Total Buy Lots', value: 950 },
  { name: 'Total Sell Lots', value: 550 },
];
