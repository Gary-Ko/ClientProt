
export enum ClientRelation {
  ALL = 'All',
  DIRECT = 'Direct',
  AGENT = 'Agent'
}

export enum CommissionStatus {
  ALL = 'All',
  SETTLED = 'Settled',
  PENDING = 'Pending'
}

export enum CashFlowStatus {
  ALL = 'All',
  SUCCESS = 'Success',
  PENDING = 'Processing',
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

export type PageContext = 'commission' | 'cashflow' | 'positions';

export interface ClientSummary {
  clientId: string;
  clientName: string;
  identity: 'Direct' | 'Agent';
  relatedInfo?: string; 
  tradingVolume: number;
  netProfitLoss: number;
  contributedCommission: number;
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
  source: string;
  account: string;
  symbol: string;
  direction: 'Buy' | 'Sell';
  lots: number;
  rate: number; 
  amount: number; 
  status: 'Settled' | 'Pending';
  openTime: string;
  holdTime: string;
  closeTime: string;
  settleTime: string | null;
}

export interface CashFlowTransaction {
  id: string;
  transactionNo: string;
  sourceType: 'Direct' | 'Agent'; 
  clientName: string;
  accountId: string; 
  type: TransactionType;
  amount: number;
  status: CashFlowStatus;
  submitTime: string;
  completeTime: string | null;
}

// New Interface for Open Positions
export interface OpenPosition {
  id: string;
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
  floatingPL: number;
  swap: number;
  comment?: string;
}

export interface FilterState {
  relation: ClientRelation;
  symbol: string; // Single select for Commission Page
  selectedSymbols: string[]; // Multi-select for Positions Page
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
  totalOpenLots: number;
  totalFloatingPL: number;
  avgHoldingTime: string;
}

export interface WalletItem {
  currency: string;
  amount: number;
  displayAmount?: string;
  color: string;
}
