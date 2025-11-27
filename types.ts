
export enum ClientRelation {
  ALL = 'All',
  DIRECT = 'Direct',
  AGENT = 'Agent'
}

export enum CommissionStatus {
  ALL = 'All',
  SETTLED = 'Settled',
  PENDING = 'Pending',
  FAILED = 'Failed'
}

export enum CashFlowStatus {
  ALL = 'All',
  SUCCESS = 'Success',
  PENDING = 'Processing',
  FAILED = 'Failed'
}

export enum CommissionStatus {
  ALL = 'All',
  SETTLED = 'Settled',
  PENDING = 'Pending',
  FAILED = 'Failed'
}

export enum TransactionType {
  DEPOSIT = 'Deposit',
  WITHDRAWAL = 'Withdrawal',
  TRANSFER = 'Transfer'
}

export enum DateRangeOption {
  TODAY = 'Today',
  THIS_WEEK = 'This Week',
  THIS_MONTH = 'This Month',
  CUSTOM = 'Custom'
}

export type PageContext = 'commission' | 'cashflow' | 'positions' | 'closed' | 'settlement';

export interface ClientSummary {
  clientId: string;
  clientName: string;
  identity: 'Direct' | 'Agent';
  relatedInfo?: string; 
  tradingVolume: number;
  tradingLots: number; // 交易手数
  orderCount: number; // 交易订单数
  netProfitLoss: number;
  contributedCommission: number; // 预估佣金（USD）
  originalCommission: number; // 实际佣金（原始货币）
  currency: string; // 币种
  settledAmount: number; // 已结算
  pendingAmount: number; // 待结算
  commissionPercentage: number;
}

export interface SettlementReport {
  id: string;
  settlementNo: string;
  cycle: string;
  amount: number; // Est. Commission (USD)
  originalAmount: number; // Commission in original currency
  sourceType: string;
  currency: string;
  sourceComposition: string; // New field: "Direct (X%) / Agent (Y%)"
  rebateAccount: string;     // New field: Commission Rebate Account
  txCount: number;
  status: 'Settled' | 'Pending';
  settleDate: string | null;
}

export interface CommissionDetail {
  id: string;
  orderId: string;
  clientName: string;
  sourceType: 'Direct' | 'Agent';
  account: string;
  openTime: string;
  closeTime: string;
  direction: 'Buy' | 'Sell';
  symbol: string;
  lots: number;
  rate: number; // 返佣标准
  amount: number; // 佣金金额
  currency: string; // 币种
  status: 'Settled' | 'Pending';
  settleTime: string | null;
  comment?: string; // 结算备注
}

export interface CashFlowTransaction {
  id: string;
  transactionNo: string;
  sourceType: 'Direct' | 'Agent'; 
  clientName: string;
  accountId: string; 
  type: TransactionType;
  currency: string;
  amount: number; // 预估金额（USD）
  originalAmount: number; // 实际金额（原始货币）
  status: CashFlowStatus;
  submitTime: string;
  completeTime: string | null;
  remark?: string; // 备注（审核不通过的理由）
}

// New Interface for Open Positions
export interface OpenPosition {
  id: string;
  orderId: string; // 订单号
  sourceType: 'Direct' | 'Agent';
  clientName: string;
  relatedMemberId?: string; // For masked display e.g. 3223***44
  accountId: string;
  openTime: string;
  symbol: string;
  direction: 'Buy' | 'Sell';
  lots: number;
  openPrice: number;
  currentPrice: number;
  takeProfit?: number; // 止盈
  stopLoss?: number; // 止损
  commission?: number; // 手续费
  swap: number; // 库存费
  floatingPL: number; // 盈亏
  comment?: string; // 备注
}

export interface FilterState {
  relation: ClientRelation;
  symbol: string; // Single select for Commission Page
  selectedSymbols: string[]; // Multi-select for Positions Page
  selectedCurrencies?: string[]; // Multi-select for Commission Page currencies
  direction?: string; // New: For Positions page
  status: string; 
  dateRange: DateRangeOption;
  customStartDate?: string;
  customEndDate?: string;
}

export interface MetricData {
  totalCommission: number;
  historicalTotal: number;
  settledAmount: number;
  directSettled: number;
  agentSettled: number;
  pendingAmount: number;
  totalLots: number;
  activeClients: number;
}

export interface CashFlowMetrics {
  totalInflow: number;
  totalOutflow: number;
  totalInternalTransfer: number;
  netCashFlow: number;
}

// New Interface for Position Metrics
export interface PositionMetrics {
  totalOpenLots: number; // 总持仓手数
  totalPositionValue: number; // 总持仓价值
  totalFloatingPL: number; // 总浮动盈亏
  avgHoldingTime: string; // 平均持仓时长
  longLots: number; // 多单数量
  shortLots: number; // 空单数量
}

// Interface for Closed Positions
export interface ClosedPosition {
  id: string;
  orderId: string; // 订单号
  server: string; // 交易服务器
  sourceType: 'Direct' | 'Agent';
  clientName: string;
  relatedMemberId?: string;
  accountId: string; // 交易账号
  openTime: string; // 开仓时间
  closeTime: string; // 平仓时间
  symbol: string; // 交易品种
  direction: 'Buy' | 'Sell'; // 交易方向
  lots: number; // 手数
  openPrice: number; // 开仓价格
  closePrice: number; // 平仓价格
  takeProfit?: number; // 止盈
  stopLoss?: number; // 止损
  commission?: number; // 手续费
  swap?: number; // 库存费
  profit: number; // 盈亏（正数表示利润，负数表示亏损）
  comment?: string; // 备注
}

// Interface for Closed Positions Metrics
export interface ClosedMetrics {
  totalTrades: number; // 总交易数
  totalLots: number; // 总手数
  totalProfit: number; // 总利润
  totalLoss: number; // 总亏损
  netPL: number; // 净盈亏
}

export interface WalletItem {
  currency: string;
  amount: number;
  displayAmount?: string;
  color: string;
}
