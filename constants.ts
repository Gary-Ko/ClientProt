
import { ClientSummary, CommissionDetail, MetricData, SettlementReport, WalletItem, CashFlowMetrics, CashFlowTransaction, TransactionType, CashFlowStatus, PositionMetrics, OpenPosition, ClosedPosition, ClosedMetrics } from './types';

export const TRADING_SYMBOLS = ['All', 'EURUSD', 'GBPUSD', 'XAUUSD', 'BTCUSD', 'US30'];
export const CURRENCIES = ['All', 'USD', 'USDT', 'EUR', 'BTC'];

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
  totalPositionValue: 1250000.00,
  totalFloatingPL: -12000.50,
  avgHoldingTime: "14h 32m",
  longLots: 850,
  shortLots: 650
};

// --- Mock Closed Positions Metrics ---
export const MOCK_CLOSED_METRICS: ClosedMetrics = {
  totalTrades: 1250,
  totalLots: 8500,
  totalProfit: 125000.00,
  totalLoss: -45000.00,
  netPL: 80000.00
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

// MOCK_CLIENTS will be defined after MOCK_DETAILS
export const MOCK_CLIENTS: ClientSummary[] = [];

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
  const currencies = ['USD', 'USDT', 'EUR', 'BTC'];
  const currency = currencies[i % currencies.length];
  
  // 实际金额（原始货币）
  const originalAmount = Number((Math.random() * 5000 + 100).toFixed(2));
  
  // 预估金额（转换为USD）
  let estimatedAmount = originalAmount;
  if (currency === 'EUR') estimatedAmount = originalAmount * 1.08;
  if (currency === 'BTC') estimatedAmount = originalAmount * 65000;
  if (currency === 'USDT') estimatedAmount = originalAmount;
  
  // 如果状态是失败，添加备注
  const remark = status === CashFlowStatus.FAILED 
    ? `审核不通过：${i % 3 === 0 ? '账户余额不足' : i % 3 === 1 ? '身份验证失败' : '交易限额超限'}`
    : undefined;

  return {
    id: `CF-${1000 + i}`,
    transactionNo: `TXN${900000 + i}`,
    sourceType: (isAgent ? 'Agent' : 'Direct') as 'Direct' | 'Agent',
    clientName: isAgent ? `Agent User ${i}` : `Client User ${i}`,
    accountId: `MT4-${10000 + i}`,
    type: type,
    currency: currency,
    amount: Number(estimatedAmount.toFixed(2)),
    originalAmount: originalAmount,
    status: status,
    submitTime: `2023-11-${String(1 + (i % 28)).padStart(2, '0')} 09:30:00`,
    completeTime: status === CashFlowStatus.SUCCESS || status === CashFlowStatus.FAILED 
      ? `2023-11-${String(1 + (i % 28)).padStart(2, '0')} 10:15:00` 
      : null,
    remark: remark
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
    orderId: `ORD-${8000 + i}`,
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
    takeProfit: direction === 'Buy' ? Number((openPrice * 1.05).toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2)) : Number((openPrice * 0.95).toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2)),
    stopLoss: direction === 'Buy' ? Number((openPrice * 0.98).toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2)) : Number((openPrice * 1.02).toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2)),
    commission: Number((Math.random() * 5 + 1).toFixed(2)),
    swap: Number(((Math.random() * 10) - 5).toFixed(2)),
    floatingPL: Number(((Math.random() * 1000) - 300).toFixed(2)),
    comment: i % 5 === 0 ? 'EA Trade' : ''
  };
}).sort((a, b) => new Date(b.openTime).getTime() - new Date(a.openTime).getTime());

export const MOCK_DETAILS: CommissionDetail[] = Array.from({ length: 50 }).map((_, i) => {
  const isAgent = i % 3 === 0;
  const name = isAgent ? `Li Si ${Math.floor(i / 3)}` : `Zhang San ${i}`;
  const currencies = ['USD', 'USDT', 'EUR', 'BTC'];
  const currency = currencies[i % currencies.length];

  return {
    id: `TRX-${i}`,
    orderId: `ORD-${8000 + i}`,
    clientName: name,
    sourceType: (isAgent ? 'Agent' : 'Direct') as 'Direct' | 'Agent',
    account: `MT4-${5000 + i}`,
    openTime: `2023-11-${String(1 + (i % 28)).padStart(2, '0')} 10:00:00`,
    closeTime: `2023-11-${String(1 + (i % 28)).padStart(2, '0')} 12:30:00`,
    symbol: TRADING_SYMBOLS[1 + (i % 5)],
    direction: (i % 2 === 0 ? 'Buy' : 'Sell') as 'Buy' | 'Sell',
    lots: Number((Math.random() * 5).toFixed(2)),
    rate: Number((Math.random() * 20 + 5).toFixed(2)),
    amount: Number((Math.random() * 50).toFixed(2)),
    currency: currency,
    status: i % 10 === 0 ? 'Pending' : 'Settled',
    settleTime: i % 10 === 0 ? null : `2023-11-${String(2 + (i % 28)).padStart(2, '0')} 02:00:00`,
    comment: i % 5 === 0 ? '正常结算' : undefined
  };
});

// Calculate trading lots and order count from MOCK_DETAILS for each client
const calculateClientStats = (details: typeof MOCK_DETAILS) => {
  const clientStatsMap = new Map<string, { lots: number; orderCount: number }>();
  
  details.forEach(detail => {
    const existing = clientStatsMap.get(detail.clientName);
    if (existing) {
      existing.lots += detail.lots;
      existing.orderCount += 1;
    } else {
      clientStatsMap.set(detail.clientName, {
        lots: detail.lots,
        orderCount: 1
      });
    }
  });
  
  return clientStatsMap;
};

// Calculate client stats from MOCK_DETAILS
const clientStatsMap = calculateClientStats(MOCK_DETAILS);

// Helper function to convert commission to USD based on currency
const convertToUSD = (amount: number, currency: string): number => {
  if (currency === 'EUR') return amount * 1.08;
  if (currency === 'BTC') return amount * 65000; // Mock rate
  if (currency === 'USDT') return amount; // USDT is pegged to USD
  return amount; // USD and others
};

// Now define MOCK_CLIENTS with calculated stats
const clientsArray: ClientSummary[] = Array.from({ length: 30 }).map((_, i) => {
  const isAgent = i % 3 === 0;
  const clientName = isAgent ? `Li Si ${Math.floor(i / 3)}` : `Zhang San ${i}`;
  const currencies = ['USD', 'USDT', 'EUR', 'BTC'];
  const currency = currencies[i % currencies.length];
  
  // 先确定实际佣金（原始货币）
  const originalCommission = Number((Math.random() * 5000 + 100).toFixed(2));
  
  // 根据币种换算成预估佣金（美元）
  const contributedCommission = convertToUSD(originalCommission, currency);
  
  const totalCommission = MOCK_METRICS.totalCommission;
  const settledAmount = contributedCommission * 0.7; // 已结算70%（美元）
  const pendingAmount = contributedCommission * 0.3; // 待结算30%（美元）
  
  // Get stats from MOCK_DETAILS, or use default values if not found
  const stats = clientStatsMap.get(clientName) || { lots: 0, orderCount: 0 };
  const tradingLots = stats.lots > 0 ? Number(stats.lots.toFixed(2)) : Number((Math.random() * 500 + 10).toFixed(2));
  const orderCount = stats.orderCount > 0 ? stats.orderCount : Math.floor(Math.random() * 200 + 10);
  
  return {
    clientId: `C-${2000 + i}`,
    clientName: clientName,
    identity: (isAgent ? 'Agent' : 'Direct') as 'Agent' | 'Direct',
    relatedInfo: isAgent && i % 2 === 0 ? `Order No. 3223${40 + i}` : undefined,
    tradingVolume: Number((Math.random() * 500 + 10).toFixed(2)),
    tradingLots: tradingLots,
    orderCount: orderCount,
    netProfitLoss: Number(((Math.random() * 4000) - 1000).toFixed(2)),
    contributedCommission: Number(contributedCommission.toFixed(2)), // 预估佣金（美元）
    originalCommission: originalCommission, // 实际佣金（原始货币）
    currency: currency,
    settledAmount: Number(settledAmount.toFixed(2)),
    pendingAmount: Number(pendingAmount.toFixed(2)),
    commissionPercentage: Number(((contributedCommission / totalCommission) * 100).toFixed(2))
  };
}).sort((a, b) => b.contributedCommission - a.contributedCommission);

// Assign to MOCK_CLIENTS
MOCK_CLIENTS.push(...clientsArray);

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

// --- Mock Closed Positions ---
export const MOCK_CLOSED_POSITIONS: ClosedPosition[] = Array.from({ length: 30 }).map((_, i) => {
  const isAgent = i % 3 === 0;
  const isSubAgentClient = isAgent && i % 2 === 0;
  const direction = i % 2 === 0 ? 'Buy' : 'Sell';
  const symbol = TRADING_SYMBOLS[1 + (i % 5)];
  const openPrice = symbol === 'XAUUSD' ? 2000 : symbol === 'BTCUSD' ? 65000 : 1.05;
  const closePrice = direction === 'Buy' ? openPrice * 1.02 : openPrice * 0.98;
  const profit = direction === 'Buy' ? (closePrice - openPrice) * 100 : (openPrice - closePrice) * 100;
  
  return {
    id: `CLOSED-${6000 + i}`,
    orderId: `ORD-${9000 + i}`,
    server: `Server-${100 + (i % 5)}`,
    sourceType: (isAgent ? 'Agent' : 'Direct') as 'Direct' | 'Agent',
    clientName: isAgent ? `Li Si ${i}` : `Zhang San ${i}`,
    relatedMemberId: isSubAgentClient ? `3223${i}${i}44` : undefined,
    accountId: `MT4-${88800 + i}`,
    openTime: `2023-11-${String(15 - (i % 10)).padStart(2, '0')} 08:30:00`,
    closeTime: `2023-11-${String(20 - (i % 10)).padStart(2, '0')} 14:30:00`,
    symbol: symbol,
    direction: direction as 'Buy' | 'Sell',
    lots: Number((Math.random() * 5 + 0.1).toFixed(2)),
    openPrice: Number(openPrice.toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2)),
    closePrice: Number(closePrice.toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2)),
    takeProfit: direction === 'Buy' ? Number((openPrice * 1.05).toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2)) : Number((openPrice * 0.95).toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2)),
    stopLoss: direction === 'Buy' ? Number((openPrice * 0.98).toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2)) : Number((openPrice * 1.02).toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2)),
    commission: Number((Math.random() * 5 + 1).toFixed(2)),
    swap: Number(((Math.random() * 10) - 5).toFixed(2)),
    profit: Number(profit.toFixed(2)),
    comment: i % 5 === 0 ? 'EA Trade' : ''
  };
}).sort((a, b) => new Date(b.closeTime).getTime() - new Date(a.closeTime).getTime());
