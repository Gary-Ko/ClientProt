
import React, { useState, useEffect } from 'react';
import { SettlementReport, ClientSummary, CashFlowTransaction, PageContext, TransactionType, CashFlowStatus, OpenPosition, ClosedPosition } from '../types';
import { formatCurrency, formatNumber } from '../utils';
import { ChevronLeft, ChevronRight, Eye, HelpCircle, User, ArrowUpRight, ArrowDownLeft, Repeat } from 'lucide-react';

interface DataTableProps {
  viewMode: 'summary' | 'clients';
  setViewMode: (mode: 'summary' | 'clients') => void;
  settlementData: SettlementReport[];
  clientData: ClientSummary[];
  cashFlowData: CashFlowTransaction[];
  openPositionsData?: OpenPosition[];
  closedPositionsData?: ClosedPosition[];
  onViewSettlement: (settlement: SettlementReport) => void;
  pageContext: PageContext;
}

const DataTable: React.FC<DataTableProps> = ({ 
  viewMode, 
  setViewMode, 
  settlementData, 
  clientData,
  cashFlowData,
  openPositionsData = [],
  closedPositionsData = [],
  onViewSettlement,
  pageContext
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Requirement: Default 5 items for Positions page, 10 for others
  const itemsPerPage = (pageContext === 'positions' || pageContext === 'closed') ? 5 : 10;
  
  // Reset page when switching views or data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, pageContext, settlementData.length, clientData.length, cashFlowData.length, openPositionsData.length, closedPositionsData.length]);

  // Helper for Transaction Status styling
  const getStatusStyle = (status: CashFlowStatus | string) => {
    switch(status) {
        case CashFlowStatus.SUCCESS:
        case 'Settled':
            return 'bg-emerald-100 text-emerald-700';
        case CashFlowStatus.PENDING:
        case 'Pending':
            return 'bg-amber-100 text-amber-700';
        case CashFlowStatus.FAILED:
            return 'bg-red-100 text-red-700';
        default:
            return 'bg-slate-100 text-slate-700';
    }
  };

  // Helper for Transaction Type icon
  const getTypeIcon = (type: TransactionType) => {
    switch(type) {
        case TransactionType.DEPOSIT:
            return <ArrowDownLeft size={14} className="text-emerald-500" />;
        case TransactionType.WITHDRAWAL:
            return <ArrowUpRight size={14} className="text-red-500" />;
        case TransactionType.TRANSFER:
            return <Repeat size={14} className="text-blue-500" />;
    }
  };

  // Table 1: Settlement Reports
  const SettlementTable = () => {
    const paginatedData = settlementData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (settlementData.length === 0) {
        return <div className="p-8 text-center text-slate-500">No settlement records found.</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold whitespace-nowrap">Settlement No.</th>
              <th className="px-6 py-3 font-semibold whitespace-nowrap">Cycle</th>
              <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1 group relative cursor-help">
                  Est. Commission
                  <HelpCircle size={14} className="text-slate-400" />
                  <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 normal-case font-normal">
                    Est. Commission中显示的是佣金金额对应的美元金额
                    <div className="absolute top-full right-2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                  </div>
                </div>
              </th>
              <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">Commission</th>
              <th className="px-6 py-3 font-semibold whitespace-nowrap">Currency</th>
              <th className="px-6 py-3 font-semibold whitespace-nowrap">Source Composition</th>
              <th className="px-6 py-3 font-semibold whitespace-nowrap">Rebate Account</th>
              <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">Tx Count</th>
              <th className="px-6 py-3 font-semibold text-center whitespace-nowrap">Status</th>
              <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">Settlement Date</th>
              <th className="px-6 py-3 font-semibold text-center whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => (
              <tr key={row.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{row.settlementNo}</td>
                <td className="px-6 py-4 text-slate-500">{row.cycle || '-'}</td>
                <td className="px-6 py-4 text-right font-bold text-emerald-600">{formatCurrency(row.amount)}</td>
                <td className="px-6 py-4 text-right font-medium text-slate-700">
                  {formatNumber(row.originalAmount)}
                </td>
                <td className="px-6 py-4 font-medium">{row.currency}</td>
                <td className="px-6 py-4 text-slate-600 font-medium">{row.sourceComposition}</td>
                <td className="px-6 py-4 text-slate-600">{row.rebateAccount}</td>
                <td className="px-6 py-4 text-right">{formatNumber(row.txCount)}</td>
                <td className="px-6 py-4 text-center">
                   <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getStatusStyle(row.status)}`}>
                     {row.status}
                   </span>
                </td>
                <td className="px-6 py-4 text-right text-slate-500">{row.settleDate || '-'}</td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => onViewSettlement(row)}
                    className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 font-medium px-3 py-1.5 rounded-md hover:bg-primary-50 transition-colors"
                  >
                    <Eye size={14} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Table 2: Client Commission Overview
  const ClientTable = () => {
    const paginatedData = clientData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (clientData.length === 0) {
        return <div className="p-8 text-center text-slate-500">No client records found.</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold whitespace-nowrap">Client Account</th>
              <th className="px-6 py-3 font-semibold whitespace-nowrap">Client Identity</th>
              <th className="px-6 py-3 font-semibold whitespace-nowrap text-right">Trading Scale</th>
              <th className="px-6 py-3 font-semibold whitespace-nowrap text-right">Contributed Commission</th>
              <th className="px-6 py-3 font-semibold whitespace-nowrap text-right">Client Net P/L</th>
              <th className="px-6 py-3 font-semibold whitespace-nowrap text-right">Contribution Ratio</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => (
              <tr key={row.clientId} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-slate-100 rounded text-slate-500">
                      <User size={14} />
                    </div>
                    {row.clientId}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {row.identity === 'Direct' ? 'Direct' : 'Agent'}: {row.clientName}
                    </span>
                    {row.relatedInfo && (
                      <span className="text-xs text-slate-400 mt-0.5">
                        ({row.relatedInfo})
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-600">
                  {formatNumber(row.tradingVolume)} lots
                </td>
                <td className="px-6 py-4 text-right font-bold text-emerald-600">
                  {formatCurrency(row.contributedCommission)}
                </td>
                <td className={`px-6 py-4 text-right font-medium ${row.netProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(row.netProfitLoss)}
                </td>
                <td className="px-6 py-4 text-right text-slate-600">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs">{row.commissionPercentage}%</span>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 rounded-full" 
                        style={{ width: `${Math.min(row.commissionPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Table 3: Cash Flow List
  const CashFlowTable = () => {
    const paginatedData = cashFlowData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const [tooltipPosition, setTooltipPosition] = useState<{ top: number; right: number } | null>(null);
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLDivElement>(null);

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setTooltipPosition({
          top: rect.top,
          right: window.innerWidth - rect.right
        });
      }
    };

    const handleMouseLeave = () => {
      setTooltipPosition(null);
    };

    if (cashFlowData.length === 0) {
        return <div className="p-8 text-center text-slate-500">No transaction records found.</div>;
    }

    return (
        <>
        <div className="overflow-x-auto relative">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">Transaction No.</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">Client Source</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">Type</th>
                <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">
                  <div 
                    ref={triggerRef}
                    className="flex items-center justify-end gap-1 group relative cursor-help"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    预估金额
                    <HelpCircle size={14} className="text-slate-400" />
                  </div>
                </th>
                <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">实际金额</th>
                <th className="px-6 py-3 font-semibold text-center whitespace-nowrap">Status</th>
                <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">Submit Time</th>
                <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">Complete Time</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">备注</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row) => (
                <tr key={row.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{row.transactionNo}</td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col">
                        <span className="font-medium text-slate-700">{row.sourceType}: {row.clientName}</span>
                        <span className="text-xs text-slate-400">ID: {row.accountId}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4 font-medium">
                     <div className="flex items-center gap-2">
                        {getTypeIcon(row.type)}
                        <span className={
                            row.type === TransactionType.DEPOSIT ? 'text-emerald-700' : 
                            row.type === TransactionType.WITHDRAWAL ? 'text-red-700' : 'text-blue-700'
                        }>
                            {row.type}
                        </span>
                     </div>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${
                      row.type === TransactionType.DEPOSIT ? 'text-emerald-600' : 
                      row.type === TransactionType.WITHDRAWAL ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {row.type === TransactionType.WITHDRAWAL ? '-' : '+'}{formatCurrency(row.amount)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-700">
                    {formatNumber(row.originalAmount)} {row.currency}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getStatusStyle(row.status)}`}>
                        {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500">{row.submitTime}</td>
                  <td className="px-6 py-4 text-right text-slate-500">{row.completeTime || '--'}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm max-w-xs">
                    <div className="truncate" title={row.remark || ''}>
                      {row.remark || '--'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tooltipPosition && (
          <div
            ref={tooltipRef}
            className="fixed w-64 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-[99999] normal-case font-normal pointer-events-none"
            style={{
              top: `${tooltipPosition.top}px`,
              right: `${tooltipPosition.right}px`,
              transform: 'translateY(calc(-100% - 8px))'
            }}
          >
            根据实际金额换算成美元，便于展示
            <div className="absolute top-full right-2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
          </div>
        )}
        </>
    );
  };

  // Table 4: Open Positions Table
  const PositionsTable = () => {
    const paginatedData = openPositionsData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (openPositionsData.length === 0) {
        return <div className="p-8 text-center text-slate-500">No open positions matching your filters.</div>;
    }

    return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">订单号</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">客户名称</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">客户关系</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">交易账户</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">开仓时间</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">交易方向</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">交易品种</th>
                <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">手数</th>
                <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">开仓价格</th>
                <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">当前价格</th>
                <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">止盈</th>
                <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">止损</th>
                <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">手续费</th>
                <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">库存费</th>
                <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">盈亏</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">备注</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row) => (
                <tr key={row.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{row.orderId}</td>
                  <td className="px-6 py-4 text-slate-700">
                    <div className="flex flex-col">
                        <span className="font-medium">{row.clientName}</span>
                        {row.relatedMemberId && (
                           <span className="text-xs text-slate-400 mt-0.5">
                             {row.relatedMemberId}
                           </span>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {row.sourceType === 'Direct' ? '直客' : '代理'}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{row.accountId}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{row.openTime}</td>
                  <td className="px-6 py-4">
                     <span className={`text-xs uppercase font-bold px-2 py-1 rounded ${row.direction === 'Buy' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                         {row.direction === 'Buy' ? '多' : '空'}
                     </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{row.symbol}</td>
                  <td className="px-6 py-4 text-right font-medium">{formatNumber(row.lots)}</td>
                  <td className="px-6 py-4 text-right text-slate-700">{formatNumber(row.openPrice)}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-800">{formatNumber(row.currentPrice)}</td>
                  <td className="px-6 py-4 text-right text-slate-600">{row.takeProfit ? formatNumber(row.takeProfit) : '--'}</td>
                  <td className="px-6 py-4 text-right text-slate-600">{row.stopLoss ? formatNumber(row.stopLoss) : '--'}</td>
                  <td className="px-6 py-4 text-right text-slate-600">{row.commission ? formatCurrency(row.commission) : '--'}</td>
                  <td className="px-6 py-4 text-right text-slate-600">{formatCurrency(row.swap)}</td>
                  <td className={`px-6 py-4 text-right font-bold ${row.floatingPL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                     {formatCurrency(row.floatingPL)}
                  </td>
                  <td className="px-6 py-4 text-slate-500 italic text-xs">{row.comment || '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    );
  };

  // Table 5: Closed Positions Table
  const ClosedTable = () => {
    const paginatedData = closedPositionsData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (closedPositionsData.length === 0) {
        return <div className="p-8 text-center text-slate-500">No closed positions matching your filters.</div>;
    }

    return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">订单号</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">交易服务器</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">客户名称</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">客户关系</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">交易账号</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">开仓时间</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">交易方向</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">交易品种</th>
                <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">手数</th>
                <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">开仓价格</th>
                <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">平仓价格</th>
                <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">止盈</th>
                <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">止损</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">平仓时间</th>
                <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">手续费</th>
                <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">库存费</th>
                <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">盈亏</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">备注</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row) => (
                <tr key={row.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{row.orderId}</td>
                  <td className="px-6 py-4 text-slate-600">{row.server}</td>
                  <td className="px-6 py-4 text-slate-700">
                    <div className="flex flex-col">
                        <span className="font-medium">{row.clientName}</span>
                        {row.relatedMemberId && (
                           <span className="text-xs text-slate-400 mt-0.5">
                             {row.relatedMemberId}
                           </span>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {row.sourceType === 'Direct' ? '直客' : '代理'}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{row.accountId}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{row.openTime}</td>
                  <td className="px-6 py-4">
                     <span className={`text-xs uppercase font-bold px-2 py-1 rounded ${row.direction === 'Buy' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                         {row.direction === 'Buy' ? '多' : '空'}
                     </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{row.symbol}</td>
                  <td className="px-6 py-4 text-right font-medium">{formatNumber(row.lots)}</td>
                  <td className="px-6 py-4 text-right text-slate-700">{formatNumber(row.openPrice)}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-800">{formatNumber(row.closePrice)}</td>
                  <td className="px-6 py-4 text-right text-slate-600">{row.takeProfit ? formatNumber(row.takeProfit) : '--'}</td>
                  <td className="px-6 py-4 text-right text-slate-600">{row.stopLoss ? formatNumber(row.stopLoss) : '--'}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{row.closeTime}</td>
                  <td className="px-6 py-4 text-right text-slate-600">{row.commission ? formatCurrency(row.commission) : '--'}</td>
                  <td className="px-6 py-4 text-right text-slate-600">{row.swap ? formatCurrency(row.swap) : '--'}</td>
                  <td className={`px-6 py-4 text-right font-bold ${row.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                     {formatCurrency(row.profit)}
                  </td>
                  <td className="px-6 py-4 text-slate-500 italic text-xs">{row.comment || '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    );
  };

  const currentCount = 
    pageContext === 'cashflow' ? cashFlowData.length :
    pageContext === 'positions' ? openPositionsData.length :
    viewMode === 'summary' ? settlementData.length : clientData.length;
    
  const maxPage = Math.ceil(currentCount / itemsPerPage);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
      {/* Header / Tabs */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        {pageContext === 'commission' ? (
            <div className="flex p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
            <button 
                onClick={() => setViewMode('summary')}
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all ${
                viewMode === 'summary' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                Settlement Reports
            </button>
            <button 
                onClick={() => setViewMode('clients')}
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all ${
                viewMode === 'clients' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                Client Commission
            </button>
            </div>
        ) : (
            <div className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                {pageContext === 'cashflow' ? 'Cash Flow List' : pageContext === 'positions' ? 'Position Status' : 'Closed Positions'}
                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {currentCount} records
                </span>
            </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-[400px]">
        {pageContext === 'cashflow' ? <CashFlowTable /> : 
         pageContext === 'positions' ? <PositionsTable /> :
         pageContext === 'closed' ? <ClosedTable /> :
         viewMode === 'summary' ? <SettlementTable /> : <ClientTable />}
      </div>

      {/* Footer / Pagination */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-sm text-slate-500 hidden sm:inline">
            Showing {currentCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, currentCount)} of {currentCount} entries
        </span>
        <span className="text-sm text-slate-500 sm:hidden">
            {currentCount} entries
        </span>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium px-2">Page {currentPage} of {maxPage || 1}</span>
            <button 
                onClick={() => setCurrentPage(p => Math.min(maxPage, p + 1))}
                disabled={currentPage === maxPage || maxPage === 0}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronRight size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
