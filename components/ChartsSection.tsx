
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, ReferenceLine
} from 'recharts';
import { CHART_TREND_DATA, CHART_SYMBOL_DATA, MOCK_CLIENTS, CHART_CASH_FLOW_TREND, CHART_STATUS_DISTRIBUTION, CHART_POSITIONS_PL_BY_SYMBOL, CHART_POSITIONS_NET_EXPOSURE } from '../constants';
import { BarChart3, PieChart as PieIcon, TrendingUp, ArrowDownUp, CandlestickChart, PieChart as PieChartIcon } from 'lucide-react';
import { PageContext } from '../types';

interface ChartsSectionProps {
  pageContext: PageContext;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
const STATUS_COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Success (Green), Pending (Amber), Failed (Red)
const BUY_SELL_COLORS = ['#10b981', '#ef4444']; // Buy (Green), Sell (Red)

const ChartsSection: React.FC<ChartsSectionProps> = ({ pageContext }) => {
  const [chartType, setChartType] = useState<'ranking' | 'distribution'>('ranking');

  // Prepare top 10 clients for ranking chart (Commission Context)
  const rankingData = MOCK_CLIENTS.slice(0, 10).map(c => ({
    name: c.clientName,
    value: c.contributedCommission
  }));

  if (pageContext === 'positions') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             {/* Chart 1: Floating P/L by Symbol (Horizontal Bar) */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <CandlestickChart size={18} className="text-slate-400" />
                        Floating P/L by Symbol
                    </h3>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={CHART_POSITIONS_PL_BY_SYMBOL} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                            <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number) => [`$${value}`, 'Floating P/L']}
                            />
                            <ReferenceLine x={0} stroke="#cbd5e1" />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {CHART_POSITIONS_PL_BY_SYMBOL.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10b981' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 2: Net Exposure (Pie Chart) */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <PieChartIcon size={18} className="text-slate-400" />
                        Net Exposure of Total Lots
                    </h3>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={CHART_POSITIONS_NET_EXPOSURE}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {CHART_POSITIONS_NET_EXPOSURE.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={BUY_SELL_COLORS[index % BUY_SELL_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} Lots`]} />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      );
  }

  if (pageContext === 'cashflow') {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             {/* Chart 1: Net Cash Flow Trend (Bar Chart with Pos/Neg) */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <TrendingUp size={18} className="text-slate-400" />
                        Net Cash Flow Trend
                    </h3>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={CHART_CASH_FLOW_TREND} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number) => [`$${value}`, 'Net Flow']}
                            />
                            <ReferenceLine y={0} stroke="#cbd5e1" />
                            <Bar dataKey="value" fill="#3b82f6">
                                {CHART_CASH_FLOW_TREND.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10b981' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 2: Transaction Status Breakdown (Pie) */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <ArrowDownUp size={18} className="text-slate-400" />
                        Transaction Status
                    </h3>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={CHART_STATUS_DISTRIBUTION}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {CHART_STATUS_DISTRIBUTION.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
  }

  // Commission Context Charts
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      
      {/* Chart 1: Switchable (Ranking / Distribution) */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-slate-800">
            {chartType === 'ranking' ? 'Top Clients Commission' : 'Symbol Distribution'}
          </h3>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setChartType('ranking')}
              className={`p-1.5 rounded-md transition-all ${
                chartType === 'ranking' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Client Ranking"
            >
              <BarChart3 size={18} />
            </button>
            <button
              onClick={() => setChartType('distribution')}
              className={`p-1.5 rounded-md transition-all ${
                chartType === 'distribution' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Symbol Distribution"
            >
              <PieIcon size={18} />
            </button>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'ranking' ? (
              <BarChart data={rankingData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={CHART_SYMBOL_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {CHART_SYMBOL_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Daily Trend */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <TrendingUp size={18} className="text-slate-400" />
            Commission Trend
          </h3>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CHART_TREND_DATA} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default ChartsSection;
