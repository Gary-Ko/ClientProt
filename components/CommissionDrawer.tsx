import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, ChevronLeft, ChevronRight, FileText, Filter } from 'lucide-react';
import { CommissionDetail, SettlementReport } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { TRADING_SYMBOLS } from '../constants';

interface CommissionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settlement: SettlementReport | null;
  allDetails: CommissionDetail[];
}

const CommissionDrawer: React.FC<CommissionDrawerProps> = ({ isOpen, onClose, settlement, allDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState<string>('All');
  const [symbolFilter, setSymbolFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
        document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset state when opening a new settlement
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setDirectionFilter('All');
      setSymbolFilter('All');
      setCurrentPage(1);
    }
  }, [isOpen, settlement?.id]);

  const filteredDetails = useMemo(() => {
    return allDetails.filter(d => {
      const searchLower = searchTerm.toLowerCase();
      // Search matches Source, Order ID, or Account
      const matchesSearch = 
        (d.sourceType || '').toLowerCase().includes(searchLower) ||
        (d.orderId || '').toLowerCase().includes(searchLower) ||
        (d.account || '').toLowerCase().includes(searchLower) ||
        (d.clientName || '').toLowerCase().includes(searchLower);
      
      const matchesDirection = directionFilter === 'All' || d.direction === directionFilter;
      
      // Filter out 'All' from symbol list matching
      const matchesSymbol = symbolFilter === 'All' || d.symbol === symbolFilter;

      return matchesSearch && matchesDirection && matchesSymbol;
    });
  }, [allDetails, searchTerm, directionFilter, symbolFilter]);

  const totalPages = Math.ceil(filteredDetails.length / itemsPerPage);
  const paginatedData = filteredDetails.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="relative w-full max-w-5xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-primary-600" size={24} />
              Commission Details
            </h2>
            {settlement && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-slate-500">
                <span>
                  Settlement No: <span className="font-medium text-slate-700">{settlement.settlementNo}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span>
                   Status: <span className={`font-medium ${settlement.status === 'Settled' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {settlement.status}
                  </span>
                </span>
                {settlement.status === 'Settled' && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>Cycle: {settlement.cycle}</span>
                  </>
                )}
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters Area */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Name, ID, Order No..." 
              className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          </div>

          {/* Filters Group */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            
            {/* Direction Filter */}
            <div className="relative w-full sm:w-40">
                <select
                    value={directionFilter}
                    onChange={(e) => setDirectionFilter(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                >
                    <option value="All">All Directions</option>
                    <option value="Buy">Buy</option>
                    <option value="Sell">Sell</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>

            {/* Symbol Filter */}
            <div className="relative w-full sm:w-40">
                <select
                    value={symbolFilter}
                    onChange={(e) => setSymbolFilter(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                >
                    <option value="All">All Symbols</option>
                    {TRADING_SYMBOLS.filter(s => s !== 'All').map(sym => (
                        <option key={sym} value={sym}>{sym}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-auto bg-slate-50 p-4">
          <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Order ID</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Source</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Product</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Direction</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">Lots</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">Rate</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">Commission</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">Open Time</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">Close Time</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.length > 0 ? (
                    paginatedData.map((row) => (
                        <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{row.orderId}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                            {row.sourceType === 'Direct' ? 'Direct' : 'Agent'}: {row.clientName}
                        </td>
                        <td className="px-4 py-3 font-medium whitespace-nowrap">{row.symbol}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                            row.direction === 'Buy' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {row.direction}
                            </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">{row.lots}</td>
                        <td className="px-4 py-3 text-right text-slate-500 whitespace-nowrap">{formatCurrency(row.rate)}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-700 whitespace-nowrap">{formatCurrency(row.amount)}</td>
                        <td className="px-4 py-3 text-right text-xs text-slate-500 whitespace-nowrap">{formatDate(row.openTime)}</td>
                        <td className="px-4 py-3 text-right text-xs text-slate-500 whitespace-nowrap">{formatDate(row.closeTime)}</td>
                        </tr>
                    ))
                    ) : (
                    <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                        No records found matching your filters.
                        </td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>
          </div>
        </div>

        {/* Footer / Pagination */}
        <div className="p-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
           <span className="text-sm text-slate-500">
             Showing {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredDetails.length)} of {filteredDetails.length} records
           </span>
           <div className="flex items-center gap-2">
             <button 
               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
               disabled={currentPage === 1}
               className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             >
               <ChevronLeft size={16} />
             </button>
             <span className="text-sm font-medium text-slate-700 px-2">
               Page {currentPage} of {totalPages || 1}
             </span>
             <button 
               onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
               disabled={currentPage === totalPages || totalPages === 0}
               className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             >
               <ChevronRight size={16} />
             </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default CommissionDrawer;