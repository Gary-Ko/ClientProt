
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, ReferenceLine
} from 'recharts';
import { CHART_TREND_DATA, CHART_SYMBOL_DATA, MOCK_CLIENTS, MOCK_CASH_FLOW_DATA, CHART_POSITIONS_PL_BY_SYMBOL, CHART_POSITIONS_NET_EXPOSURE } from '../constants';
import { BarChart3, PieChart as PieIcon, TrendingUp, ArrowDownUp, CandlestickChart, PieChart as PieChartIcon, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { PageContext, TransactionType, CashFlowTransaction } from '../types';
import { formatCurrency, formatNumber } from '../utils';

interface ChartsSectionProps {
  pageContext: PageContext;
  cashFlowData?: CashFlowTransaction[]; // Filtered cash flow data
  openPositionsData?: any[]; // Filtered open positions data
  closedPositionsData?: any[]; // Filtered closed positions data
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
// const STATUS_COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Removed unused colors
const BUY_SELL_COLORS = ['#10b981', '#ef4444']; // Buy (Green), Sell (Red)
const DEPOSIT_COLOR = '#10b981'; // Green
const WITHDRAWAL_COLOR = '#ef4444'; // Red

const ChartsSection: React.FC<ChartsSectionProps> = ({ pageContext, cashFlowData, openPositionsData = [], closedPositionsData = [] }) => {
  const [chartType, setChartType] = useState<'ranking' | 'distribution'>('ranking');
  
  // --- Cash Flow Chart States ---
  const [cfRankingType, setCfRankingType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [cfCurrency, setCfCurrency] = useState<string>('USD'); // Default to USD, will be updated dynamically if needed
  
  // --- Positions Chart States ---
  const [posRankingType, setPosRankingType] = useState<'lots' | 'orders' | 'pl'>('lots');
  
  // Use filtered data if provided, otherwise fall back to all data
  const effectiveCashFlowData = cashFlowData || MOCK_CASH_FLOW_DATA;
  
  // Use closed positions data for closed page, open positions data for positions page
  const effectivePositionsData = pageContext === 'closed' ? closedPositionsData : openPositionsData;

  // Prepare top 10 clients for ranking chart (Commission Context)
  const rankingData = MOCK_CLIENTS.slice(0, 10).map(c => ({
    name: c.clientName,
    value: c.contributedCommission
  }));

  // --- Cash Flow Chart Data Logic ---
  
  // 1. Ranking Data Preparation (Deposit/Withdrawal Ranking)
  const cashFlowRankingData = useMemo(() => {
    if (pageContext !== 'cashflow') return [];
    
    // Helper to normalize amount to USD (Simple mock conversion)
    const normalizeToUSD = (amount: number, currency: string) => {
        if (currency === 'EUR') return amount * 1.08;
        if (currency === 'BTC') return amount * 65000; // Mock rate
        if (currency === 'USDT') return amount;
        return amount; // USD and others
    };

    const targetType = cfRankingType === 'deposit' ? 'Deposit' : 'Withdrawal';
    
    // Group by Client
    const clientMap = new Map<string, { name: string, value: number, relation: string }>();

    effectiveCashFlowData.forEach(tx => {
        if (tx.type === targetType) {
            const existing = clientMap.get(tx.clientName);
            // amount is already in USD (estimated), so use it directly
            const usdAmount = tx.amount;
            
            if (existing) {
                existing.value += usdAmount;
            } else {
                clientMap.set(tx.clientName, {
                    name: tx.clientName,
                    value: usdAmount,
                    relation: tx.sourceType
                });
            }
        }
    });

    // Convert to array, sort, and slice top 10
    return Array.from(clientMap.values())
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
        .map(item => ({
            ...item,
            value: Number(item.value.toFixed(2))
        }));

  }, [pageContext, cfRankingType, effectiveCashFlowData]);

  // 2. Distribution Data Preparation (Deposit vs Withdrawal Ratio by Currency)
  const cashFlowDistributionData = useMemo(() => {
    if (pageContext !== 'cashflow') return [];

    let depositTotal = 0;
    let withdrawalTotal = 0;

    effectiveCashFlowData.forEach(tx => {
        if (tx.currency === cfCurrency) {
            if (tx.type === TransactionType.DEPOSIT) {
                depositTotal += tx.originalAmount; // Use original amount for pie chart
            } else if (tx.type === TransactionType.WITHDRAWAL) {
                withdrawalTotal += tx.originalAmount;
            }
        }
    });

    // If no data, avoid empty chart issues? Recharts handles empty data gracefully usually.
    // But let's return 0 if empty to show "No Data" effectively or just empty segments.
    const total = depositTotal + withdrawalTotal;
    if (total === 0) return [];

    return [
        { name: 'Deposit', value: depositTotal, fill: DEPOSIT_COLOR },
        { name: 'Withdrawal', value: withdrawalTotal, fill: WITHDRAWAL_COLOR }
    ];

  }, [pageContext, cfCurrency, effectiveCashFlowData]);

  // Get unique currencies for the dropdown
  const availableCurrencies = useMemo(() => {
    const currencies = new Set<string>();
    effectiveCashFlowData.forEach(tx => currencies.add(tx.currency));
    return Array.from(currencies);
  }, [effectiveCashFlowData]);


  // --- Positions Chart Data Logic ---
  const positionsRankingData = useMemo(() => {
    if ((pageContext !== 'positions' && pageContext !== 'closed') || !effectivePositionsData.length) return [];
    
    // Group by Client
    const clientMap = new Map<string, { name: string, lots: number, orders: number, pl: number, relation: string }>();
    
    effectivePositionsData.forEach(pos => {
      const existing = clientMap.get(pos.clientName);
      if (existing) {
        existing.lots += pos.lots;
        existing.orders += 1;
        existing.pl += pos.floatingPL;
      } else {
        clientMap.set(pos.clientName, {
          name: pos.clientName,
          lots: pos.lots,
          orders: 1,
          pl: pos.floatingPL,
          relation: pos.sourceType === 'Direct' ? 'Direct' : 'Agent'
        });
      }
    });
    
    // Convert to array and sort by selected metric
    const data = Array.from(clientMap.values());
    let sortKey: 'lots' | 'orders' | 'pl' = posRankingType;
    data.sort((a, b) => b[sortKey] - a[sortKey]);
    
    // Return top 10 with the selected value
    return data.slice(0, 10).map(item => ({
      name: item.name,
      value: item[sortKey],
      relation: item.relation,
      lots: item.lots,
      orders: item.orders,
      pl: item.pl
    }));
  }, [pageContext, effectivePositionsData, posRankingType]);

  const positionsDistributionData = useMemo(() => {
    if ((pageContext !== 'positions' && pageContext !== 'closed') || !effectivePositionsData.length) return [];
    
    // Group by Symbol
    const symbolMap = new Map<string, number>();
    effectivePositionsData.forEach(pos => {
      const existing = symbolMap.get(pos.symbol) || 0;
      symbolMap.set(pos.symbol, existing + pos.lots);
    });
    
    // Convert to array, sort by lots, take top 5
    const sorted = Array.from(symbolMap.entries())
      .map(([name, lots]) => ({ name, lots }))
      .sort((a, b) => b.lots - a.lots);
    
    const top5 = sorted.slice(0, 5);
    const others = sorted.slice(5).reduce((sum, item) => sum + item.lots, 0);
    
    const result = top5.map(item => ({ name: item.name, value: item.lots }));
    if (others > 0) {
      result.push({ name: 'Other', value: others });
    }
    
    return result;
  }, [pageContext, effectivePositionsData]);

  if (pageContext === 'positions' || pageContext === 'closed') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             {/* Chart 1: Client Ranking */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <CandlestickChart size={18} className="text-slate-400" />
                        Client Ranking
                    </h3>
                    {/* Filter Dimension */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setPosRankingType('lots')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                posRankingType === 'lots' 
                                ? 'bg-white shadow-sm text-primary-600' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Lots
                        </button>
                        <button
                            onClick={() => setPosRankingType('orders')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                posRankingType === 'orders' 
                                ? 'bg-white shadow-sm text-primary-600' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Number of Trades
                        </button>
                        <button
                            onClick={() => setPosRankingType('pl')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                posRankingType === 'pl' 
                                ? 'bg-white shadow-sm text-primary-600' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Floating P/L
                        </button>
                    </div>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={positionsRankingData} layout="horizontal" margin={{ left: 100, right: 30, top: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="name" 
                                type="category" 
                                tick={{ fontSize: 12, fill: '#64748b' }} 
                                axisLine={false} 
                                tickLine={false}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis 
                                type="number" 
                                tick={{ fontSize: 12, fill: '#64748b' }} 
                                axisLine={false} 
                                tickLine={false}
                                tickFormatter={(value) => {
                                    if (posRankingType === 'pl') {
                                        return `$${formatNumber(value)}`;
                                    }
                                    return formatNumber(value);
                                }}
                            />
                            <Tooltip 
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        const labelMap: Record<string, string> = {
                                          lots: 'Lots',
                                          orders: 'Number of Trades',
                                          pl: 'Floating P/L'
                                        };
                                        const valueDisplay = posRankingType === 'pl' 
                                          ? formatCurrency(data.value)
                                          : posRankingType === 'lots'
                                          ? formatNumber(data.value)
                                          : data.value.toString();
                                        return (
                                            <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100">
                                                <p className="font-medium text-slate-800 mb-1">{data.name}</p>
                                                <div className="text-xs text-slate-500 mb-2">Client Relation: <span className="font-medium text-slate-700">{data.relation}</span></div>
                                                <div className="text-sm font-bold text-primary-600">
                                                    {valueDisplay} {labelMap[posRankingType]}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar 
                                dataKey="value" 
                                fill="#3b82f6" 
                                radius={[0, 4, 4, 0]} 
                                barSize={20} 
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 2: Product Type Distribution */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <PieChartIcon size={18} className="text-slate-400" />
                        Product Type Distribution
                    </h3>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={positionsDistributionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {positionsDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        const total = positionsDistributionData.reduce((sum, item) => sum + item.value, 0);
                                        const percent = ((Number(data.value) / total) * 100).toFixed(1);
                                        return (
                                            <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color }}></div>
                                                    <span className="font-medium text-slate-800">{data.name}</span>
                                                </div>
                                                <div className="text-xs text-slate-500 mb-1">Lots: <span className="font-medium text-slate-700">{data.value.toLocaleString()}</span></div>
                                                <div className="text-sm font-bold text-slate-900">{percent}%</div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
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
             {/* Chart 1: Deposit/Withdrawal Ranking */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <TrendingUp size={18} className="text-slate-400" />
                        Deposit/Withdrawal Ranking
                    </h3>
                    {/* Toggle Button */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setCfRankingType('deposit')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                                cfRankingType === 'deposit' 
                                ? 'bg-white shadow-sm text-emerald-600' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <ArrowDownCircle size={14} />
                            Deposit
                        </button>
                        <button
                            onClick={() => setCfRankingType('withdrawal')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                                cfRankingType === 'withdrawal' 
                                ? 'bg-white shadow-sm text-red-600' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <ArrowUpCircle size={14} />
                            Withdrawal
                        </button>
                    </div>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cashFlowRankingData} layout="horizontal" margin={{ left: 80, right: 30, top: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip 
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100">
                                                <p className="font-medium text-slate-800 mb-1">{data.name}</p>
                                                <div className="text-xs text-slate-500 mb-2">Client Relation: <span className="font-medium text-slate-700">{data.relation === 'Direct' ? 'Direct' : 'Agent'}</span></div>
                                                <div className={`text-sm font-bold ${cfRankingType === 'deposit' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    ${data.value.toLocaleString()}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar 
                                dataKey="value" 
                                fill={cfRankingType === 'deposit' ? DEPOSIT_COLOR : WITHDRAWAL_COLOR} 
                                radius={[4, 4, 0, 0]} 
                                barSize={20} 
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 2: Deposit/Withdrawal Ratio (Pie) */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <ArrowDownUp size={18} className="text-slate-400" />
                        D/W Ratio
                    </h3>
                    {/* Currency Selector */}
                    <select 
                        value={cfCurrency} 
                        onChange={(e) => setCfCurrency(e.target.value)}
                        className="bg-slate-50 border-none text-sm font-medium text-slate-700 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                        {availableCurrencies.map(curr => (
                            <option key={curr} value={curr}>{curr}</option>
                        ))}
                    </select>
                </div>
                <div className="h-[300px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={cashFlowDistributionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {cashFlowDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip 
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0];
                                        const total = cashFlowDistributionData.reduce((sum, item) => sum + item.value, 0);
                                        const percent = ((Number(data.value) / total) * 100).toFixed(1);
                                        
                                        return (
                                            <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.payload.fill }}></div>
                                                    <span className="font-medium text-slate-800">{data.name}</span>
                                                </div>
                                                <div className="text-xs text-slate-500 mb-1">Currency: <span className="font-medium text-slate-700">{cfCurrency}</span></div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-sm font-bold text-slate-900">{Number(data.value).toLocaleString()}</span>
                                                    <span className="text-xs text-slate-500">({percent}%)</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Center Text for Total Volume or Ratio - Optional polish */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                         <div className="text-xs text-slate-400 font-medium">Currency</div>
                         <div className="text-lg font-bold text-slate-700">{cfCurrency}</div>
                    </div>
                </div>
            </div>
        </div>
    )
  }

  // Commission Context Charts
  if (pageContext === 'commission') {
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
              <BarChart data={rankingData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
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
  }

  return null;
};

export default ChartsSection;
