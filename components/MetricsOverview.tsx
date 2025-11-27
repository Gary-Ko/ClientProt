
import React, { useMemo } from 'react';
import { MetricData, CashFlowMetrics, PageContext, PositionMetrics, CashFlowTransaction, TransactionType, ClosedMetrics, SettlementMetrics } from '../types';
import { formatCurrency, formatNumber } from '../utils';
import { DollarSign, Activity, Users, Wallet, Clock, ChevronRight, ArrowDownLeft, ArrowUpRight, BarChart4, Hourglass, Layers, TrendingUp, ArrowDownUp, Scale, FileText, TrendingDown } from 'lucide-react';

interface MetricsOverviewProps {
  metrics: MetricData | CashFlowMetrics | PositionMetrics | ClosedMetrics | SettlementMetrics;
  pageContext: PageContext;
  onTotalClick: () => void;
  onSettledClick: () => void;
  onPendingClick: () => void;
  cashFlowData?: CashFlowTransaction[]; // For calculating currency breakdown
  walletData?: { total?: any[]; settled?: any[]; pending?: any[] }; // For displaying commission breakdown
}

const MetricsOverview: React.FC<MetricsOverviewProps> = ({ 
  metrics, 
  pageContext,
  onTotalClick,
  onSettledClick,
  onPendingClick,
  cashFlowData = [],
  walletData
}) => {
  
  // Calculate currency breakdown (grouped by currency)
  const currencyBreakdown = useMemo(() => {
    if (pageContext !== 'cashflow' || !cashFlowData.length) return { inflow: {}, outflow: {}, net: {} };
    
    const inflow: Record<string, number> = {};
    const outflow: Record<string, number> = {};
    
    cashFlowData.forEach(tx => {
      if (tx.type === TransactionType.DEPOSIT) {
        inflow[tx.currency] = (inflow[tx.currency] || 0) + tx.originalAmount;
      } else if (tx.type === TransactionType.WITHDRAWAL) {
        outflow[tx.currency] = (outflow[tx.currency] || 0) + tx.originalAmount;
      }
    });
    
    // Calculate net cash flow
    const net: Record<string, number> = {};
    const allCurrencies = new Set([...Object.keys(inflow), ...Object.keys(outflow)]);
    allCurrencies.forEach(currency => {
      net[currency] = (inflow[currency] || 0) - (outflow[currency] || 0);
    });
    
    return { inflow, outflow, net };
  }, [pageContext, cashFlowData]);
  
  // Render Settlement Report Metrics
  if (pageContext === 'settlement') {
    const settlementMetrics = metrics as SettlementMetrics;
    return (
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <div className="mb-6">
          <p className="text-slate-500 text-sm font-medium mb-2">Estimated Settled Commission</p>
          <h3 className="text-3xl font-bold text-emerald-600">
            {formatCurrency(settlementMetrics.estimatedSettledCommission)}
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {settlementMetrics.currencyBreakdown.map((item) => (
            <div key={item.currency} className={`p-4 rounded-lg ${item.color}`}>
              <div className="text-xs font-medium mb-1 opacity-80">{item.currency}</div>
              <div className="text-lg font-bold">
                {item.displayAmount || formatNumber(item.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render Closed Positions Metrics
  if (pageContext === 'closed') {
    const closedMetrics = metrics as ClosedMetrics;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
             {/* 1. Total Trades */}
             <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Trades</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatNumber(closedMetrics.totalTrades)}</h3>
                    </div>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <FileText size={20} />
                    </div>
                </div>
                <div className="text-xs text-slate-400">Total trades</div>
            </div>

            {/* 2. Total Lots */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Lots</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatNumber(closedMetrics.totalLots)} <span className="text-base font-normal text-slate-500">Lots</span></h3>
                    </div>
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Layers size={20} />
                    </div>
                </div>
                <div className="text-xs text-slate-400">Total lots</div>
            </div>

            {/* 3. Net P/L */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Net P/L</p>
                        <h3 className={`text-2xl font-bold mt-1 ${closedMetrics.netPL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(closedMetrics.netPL)}
                        </h3>
                    </div>
                    <div className={`p-2 rounded-lg ${closedMetrics.netPL >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        <BarChart4 size={20} />
                    </div>
                </div>
                <div className="text-xs text-slate-400">Net P/L</div>
            </div>
        </div>
    );
  }

  // Render Open Positions Metrics
  if (pageContext === 'positions') {
    const posMetrics = metrics as PositionMetrics;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
             {/* 1. Total Open Lots */}
             <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Open Lots</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatNumber(posMetrics.totalOpenLots)} <span className="text-base font-normal text-slate-500">Lots</span></h3>
                    </div>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Layers size={20} />
                    </div>
                </div>
                <div className="text-xs text-slate-400">Real-time exposure</div>
            </div>

            {/* 2. Total Position Value */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Position Value</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(posMetrics.totalPositionValue)}</h3>
                    </div>
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <DollarSign size={20} />
                    </div>
                </div>
                <div className="text-xs text-slate-400">Total position value</div>
            </div>

            {/* 3. Total Floating P/L */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Floating P/L</p>
                        <h3 className={`text-2xl font-bold mt-1 ${posMetrics.totalFloatingPL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(posMetrics.totalFloatingPL)}
                        </h3>
                    </div>
                    <div className={`p-2 rounded-lg ${posMetrics.totalFloatingPL >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        <TrendingUp size={20} />
                    </div>
                </div>
                <div className="text-xs text-slate-400">Unrealized profit/loss</div>
            </div>

            {/* 4. Average Holding Time */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Average Holding Time</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{posMetrics.avgHoldingTime}</h3>
                    </div>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                        <Hourglass size={20} />
                    </div>
                </div>
                <div className="text-xs text-slate-400">Duration of open trades</div>
            </div>

            {/* 5. Net Positions */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                        <Scale size={20} />
                    </div>
                    <p className="text-slate-700 text-sm font-medium">Net Positions</p>
                </div>
                <div className="flex items-center justify-between">
                    {/* Left: Main Direction */}
                    <div>
                        <h3 className={`text-3xl font-bold ${posMetrics.longLots >= posMetrics.shortLots ? 'text-emerald-600' : 'text-red-600'}`}>
                            {posMetrics.longLots >= posMetrics.shortLots ? 'Long' : 'Short'}
                        </h3>
                    </div>
                    {/* Right: Long/Short Quantities */}
                    <div className="text-sm text-slate-600 text-right">
                        <div>Long: <span className="font-semibold text-slate-800">{formatNumber(posMetrics.longLots)}</span></div>
                        <div>Short: <span className="font-semibold text-slate-800">{formatNumber(posMetrics.shortLots)}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // Render Cash Flow Metrics Cards
  if (pageContext === 'cashflow') {
    const cfMetrics = metrics as CashFlowMetrics;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* 1. Total Inflow */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Est. Total Inflow</p>
                        <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(cfMetrics.totalInflow)}</h3>
                    </div>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <ArrowDownLeft size={20} />
                    </div>
                </div>
                <div className="text-xs text-slate-400">Total processed deposits</div>
                
                {/* Currency Breakdown Tooltip */}
                {Object.keys(currencyBreakdown.inflow).length > 0 && (
                    <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        <div className="font-semibold mb-2 text-sm">Currency Breakdown:</div>
                        {Object.entries(currencyBreakdown.inflow).map(([currency, amount]) => (
                            <div key={currency} className="flex justify-between items-center mb-1">
                                <span>{currency}:</span>
                                <span className="font-medium">{formatNumber(amount)}</span>
                            </div>
                        ))}
                        <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                )}
            </div>

            {/* 2. Total Outflow */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Est. Total Outflow</p>
                        <h3 className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(cfMetrics.totalOutflow)}</h3>
                    </div>
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                        <ArrowUpRight size={20} />
                    </div>
                </div>
                <div className="text-xs text-slate-400">Total processed withdrawals</div>
                
                {/* Currency Breakdown Tooltip */}
                {Object.keys(currencyBreakdown.outflow).length > 0 && (
                    <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        <div className="font-semibold mb-2 text-sm">Currency Breakdown:</div>
                        {Object.entries(currencyBreakdown.outflow).map(([currency, amount]) => (
                            <div key={currency} className="flex justify-between items-center mb-1">
                                <span>{currency}:</span>
                                <span className="font-medium">{formatNumber(amount)}</span>
                            </div>
                        ))}
                        <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                )}
            </div>

            {/* 3. Net Cash Flow */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Est. Net Cash Flow</p>
                        <h3 className={`text-2xl font-bold mt-1 ${cfMetrics.netCashFlow >= 0 ? 'text-slate-800' : 'text-slate-600'}`}>
                            {formatCurrency(cfMetrics.netCashFlow)}
                        </h3>
                    </div>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                        <BarChart4 size={20} />
                    </div>
                </div>
                <div className="text-xs text-slate-400">Inflow - Outflow</div>
                
                {/* Currency Breakdown Tooltip */}
                {Object.keys(currencyBreakdown.net).length > 0 && (
                    <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        <div className="font-semibold mb-2 text-sm">Currency Breakdown:</div>
                        {Object.entries(currencyBreakdown.net).map(([currency, amount]) => (
                            <div key={currency} className="flex justify-between items-center mb-1">
                                <span>{currency}:</span>
                                <span className={`font-medium ${amount >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                                    {amount >= 0 ? '+' : ''}{formatNumber(amount)}
                                </span>
                            </div>
                        ))}
                        <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                )}
            </div>
        </div>
    );
  }

  // Render Commission Report Metrics Cards
  const comMetrics = metrics as MetricData;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Metric 1: Est. Total Commission (Hover Tooltip) */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-slate-500 text-sm font-medium">Est. Total Commission</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {formatCurrency(comMetrics.totalCommission)}
            </h3>
          </div>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <DollarSign size={20} />
          </div>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">History</span>
          <span>Total: {formatCurrency(comMetrics.historicalTotal)}</span>
        </div>
        
        {/* Currency Breakdown Tooltip */}
        {walletData?.total && walletData.total.length > 0 && (
          <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <div className="font-semibold mb-2 text-sm">Currency Breakdown:</div>
            {walletData.total.map((item: any) => (
              <div key={item.currency} className="flex justify-between items-center mb-1">
                <span>{item.currency}:</span>
                <span className="font-medium">
                  {item.displayAmount || formatNumber(item.amount)}
                </span>
              </div>
            ))}
            <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-800"></div>
          </div>
        )}
      </div>

      {/* Metric 2: Est. Settled Commission (Hover Tooltip) */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-slate-500 text-sm font-medium">Est. Settled Commission</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(comMetrics.settledAmount)}</h3>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Wallet size={20} />
          </div>
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Available for withdrawal
        </div>
        
        {/* Currency Breakdown Tooltip */}
        {walletData?.settled && walletData.settled.length > 0 && (
          <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <div className="font-semibold mb-2 text-sm">Currency Breakdown:</div>
            {walletData.settled.map((item: any) => (
              <div key={item.currency} className="flex justify-between items-center mb-1">
                <span>{item.currency}:</span>
                <span className="font-medium">
                  {item.displayAmount || formatNumber(item.amount)}
                </span>
              </div>
            ))}
            <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-800"></div>
          </div>
        )}
      </div>

      {/* Metric 3: Est. Pending Commission (Hover Tooltip) */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-slate-500 text-sm font-medium">Est. Pending Commission</p>
            <h3 className="text-2xl font-bold text-amber-500 mt-1">{formatCurrency(comMetrics.pendingAmount)}</h3>
          </div>
          <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
            <Clock size={20} />
          </div>
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Waiting for settlement
        </div>
        
        {/* Currency Breakdown Tooltip */}
        {walletData?.pending && walletData.pending.length > 0 && (
          <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <div className="font-semibold mb-2 text-sm">Currency Breakdown:</div>
            {walletData.pending.map((item: any) => (
              <div key={item.currency} className="flex justify-between items-center mb-1">
                <span>{item.currency}:</span>
                <span className="font-medium">
                  {item.displayAmount || formatNumber(item.amount)}
                </span>
              </div>
            ))}
            <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-800"></div>
          </div>
        )}
      </div>

      {/* Metric 4: Volume & Activity */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Volume</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatNumber(comMetrics.totalLots)} <span className="text-sm font-normal text-slate-400">lots</span></h3>
          </div>
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <Activity size={20} />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Users size={14} className="text-slate-400" />
                <span className="text-xs text-slate-500">Active Clients</span>
            </div>
            <span className="text-sm font-bold text-slate-700">{comMetrics.activeClients}</span>
        </div>
      </div>
    </div>
  );
};

export default MetricsOverview;
