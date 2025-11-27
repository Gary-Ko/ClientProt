
import React from 'react';
import { MetricData, CashFlowMetrics, PageContext, PositionMetrics } from '../types';
import { formatCurrency, formatNumber } from '../utils';
import { DollarSign, Activity, Users, Wallet, Clock, ChevronRight, ArrowDownLeft, ArrowUpRight, Repeat, BarChart4, Hourglass, Layers, TrendingUp } from 'lucide-react';

interface MetricsOverviewProps {
  metrics: MetricData | CashFlowMetrics | PositionMetrics;
  pageContext: PageContext;
  onTotalClick: () => void;
  onSettledClick: () => void;
  onPendingClick: () => void;
}

const MetricsOverview: React.FC<MetricsOverviewProps> = ({ 
  metrics, 
  pageContext,
  onTotalClick,
  onSettledClick,
  onPendingClick 
}) => {
  
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* 1. Total Inflow */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Inflow</p>
                        <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(cfMetrics.totalInflow)}</h3>
                    </div>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <ArrowDownLeft size={20} />
                    </div>
                </div>
                <div className="text-xs text-slate-400">Total processed deposits</div>
            </div>

            {/* 2. Total Outflow */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Outflow</p>
                        <h3 className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(cfMetrics.totalOutflow)}</h3>
                    </div>
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                        <ArrowUpRight size={20} />
                    </div>
                </div>
                <div className="text-xs text-slate-400">Total processed withdrawals</div>
            </div>

            {/* 3. Internal Transfer */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Internal Transfer</p>
                        <h3 className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(cfMetrics.totalInternalTransfer)}</h3>
                    </div>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Repeat size={20} />
                    </div>
                </div>
                <div className="text-xs text-slate-400">Internal account movements</div>
            </div>

            {/* 4. Net Cash Flow */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Net Cash Flow</p>
                        <h3 className={`text-2xl font-bold mt-1 ${cfMetrics.netCashFlow >= 0 ? 'text-slate-800' : 'text-slate-600'}`}>
                            {formatCurrency(cfMetrics.netCashFlow)}
                        </h3>
                    </div>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                        <BarChart4 size={20} />
                    </div>
                </div>
                <div className="text-xs text-slate-400">Inflow - Outflow</div>
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
