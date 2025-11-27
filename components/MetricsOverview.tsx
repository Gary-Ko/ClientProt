
import React, { useMemo } from 'react';
import { MetricData, CashFlowMetrics, PageContext, PositionMetrics, CashFlowTransaction, TransactionType } from '../types';
import { formatCurrency, formatNumber } from '../utils';
import { DollarSign, Activity, Users, Wallet, Clock, ChevronRight, ArrowDownLeft, ArrowUpRight, BarChart4, Hourglass, Layers, TrendingUp } from 'lucide-react';

interface MetricsOverviewProps {
  metrics: MetricData | CashFlowMetrics | PositionMetrics;
  pageContext: PageContext;
  onTotalClick: () => void;
  onSettledClick: () => void;
  onPendingClick: () => void;
  cashFlowData?: CashFlowTransaction[]; // 用于计算货币明细
}

const MetricsOverview: React.FC<MetricsOverviewProps> = ({ 
  metrics, 
  pageContext,
  onTotalClick,
  onSettledClick,
  onPendingClick,
  cashFlowData = []
}) => {
  
  // 计算货币明细（按币种汇总）
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
    
    // 计算净现金流
    const net: Record<string, number> = {};
    const allCurrencies = new Set([...Object.keys(inflow), ...Object.keys(outflow)]);
    allCurrencies.forEach(currency => {
      net[currency] = (inflow[currency] || 0) - (outflow[currency] || 0);
    });
    
    return { inflow, outflow, net };
  }, [pageContext, cashFlowData]);
  
  // Render Open Positions Metrics
  if (pageContext === 'positions') {
    const posMetrics = metrics as PositionMetrics;
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* 2. Total Floating P/L */}
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

            {/* 3. Avg Holding Time */}
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
                        <p className="text-slate-500 text-sm font-medium">预估 Total Inflow</p>
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
                        <div className="font-semibold mb-2 text-sm">货币明细：</div>
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
                        <p className="text-slate-500 text-sm font-medium">预估 Total Outflow</p>
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
                        <div className="font-semibold mb-2 text-sm">货币明细：</div>
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
                        <p className="text-slate-500 text-sm font-medium">预估 Net Cash Flow</p>
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
                        <div className="font-semibold mb-2 text-sm">货币明细：</div>
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
      {/* Metric 1: Est. Total Commission (Clickable) */}
      <div 
        onClick={onTotalClick}
        className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="text-slate-300" size={20} />
        </div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-slate-500 text-sm font-medium">Est. Total Commission</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1 group-hover:text-primary-600 transition-colors">
              {formatCurrency(comMetrics.totalCommission)}
            </h3>
          </div>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
            <DollarSign size={20} />
          </div>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium group-hover:bg-slate-200">History</span>
          <span>Total: {formatCurrency(comMetrics.historicalTotal)}</span>
        </div>
      </div>

      {/* Metric 2: Est. Settled Commission (Clickable) */}
      <div 
        onClick={onSettledClick}
        className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="text-slate-300" size={20} />
        </div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-slate-500 text-sm font-medium">Est. Settled Commission</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(comMetrics.settledAmount)}</h3>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
            <Wallet size={20} />
          </div>
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Available for withdrawal
        </div>
      </div>

      {/* Metric 3: Est. Pending Commission (Clickable) */}
      <div 
        onClick={onPendingClick}
        className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="text-slate-300" size={20} />
        </div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-slate-500 text-sm font-medium">Est. Pending Commission</p>
            <h3 className="text-2xl font-bold text-amber-500 mt-1">{formatCurrency(comMetrics.pendingAmount)}</h3>
          </div>
          <div className="p-2 bg-amber-50 text-amber-500 rounded-lg group-hover:bg-amber-100 transition-colors">
            <Clock size={20} />
          </div>
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Waiting for settlement
        </div>
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
