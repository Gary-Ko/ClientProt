
import React, { useState, useRef, useEffect } from 'react';
import { FilterState, ClientRelation, CommissionStatus, CashFlowStatus, DateRangeOption, PageContext } from '../types';
import { TRADING_SYMBOLS, CURRENCIES } from '../constants';
import { Download, Filter, Search, X, ChevronDown, Check } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onExport: () => void;
  pageContext: PageContext;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, searchTerm, setSearchTerm, onExport, pageContext }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSymbolDropdownOpen, setIsSymbolDropdownOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  
  const filterRef = useRef<HTMLDivElement>(null);
  const symbolDropdownRef = useRef<HTMLDivElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (symbolDropdownRef.current && !symbolDropdownRef.current.contains(event.target as Node)) {
        setIsSymbolDropdownOpen(false);
      }
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target as Node)) {
        setIsCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleDateRangeChange = (range: DateRangeOption) => {
    setFilters(prev => ({ ...prev, dateRange: range }));
  };

  const removeFilter = (key: keyof FilterState, defaultValue: any) => {
    setFilters(prev => ({ ...prev, [key]: defaultValue }));
  };

  const clearAllFilters = () => {
    setFilters(prev => ({
      ...prev,
      relation: ClientRelation.ALL,
      symbol: 'All',
      selectedSymbols: ['All'],
      selectedCurrencies: ['All'],
      direction: 'All',
      status: pageContext === 'commission' ? CommissionStatus.ALL : pageContext === 'cashflow' ? CashFlowStatus.ALL : 'All'
    }));
  };

  const toggleSymbol = (sym: string) => {
      let current = [...(filters.selectedSymbols || ['All'])];
      if (sym === 'All') {
          current = ['All'];
      } else {
          if (current.includes('All')) current = [];
          
          if (current.includes(sym)) {
              current = current.filter(s => s !== sym);
          } else {
              current.push(sym);
          }
          
          if (current.length === 0) current = ['All'];
      }
      setFilters(prev => ({ ...prev, selectedSymbols: current }));
  };

  const toggleCurrency = (currency: string) => {
      let current = [...(filters.selectedCurrencies || ['All'])];
      if (currency === 'All') {
          current = ['All'];
      } else {
          if (current.includes('All')) current = [];
          
          if (current.includes(currency)) {
              current = current.filter(c => c !== currency);
          } else {
              current.push(currency);
          }
          
          if (current.length === 0) current = ['All'];
      }
      setFilters(prev => ({ ...prev, selectedCurrencies: current }));
  };

  // Define available options based on context
  const statusOptions = pageContext === 'commission' 
    ? Object.values(CommissionStatus) 
    : pageContext === 'cashflow' ? Object.values(CashFlowStatus) : [];
    
  // "Client Relation" is reused as "Tier View" for Cash Flow & Positions page
  const relationLabel = pageContext === 'commission' ? 'Client Relation' : 'Tier View';
  const relationOptions = Object.values(ClientRelation); 

  // Determine which filters are active (non-default)
  const activeFilters = [
    {
      key: 'relation',
      label: relationLabel,
      value: filters.relation,
      defaultValue: ClientRelation.ALL
    },
    // Only add Status filter if not Positions or Closed Page
    ...(pageContext !== 'positions' && pageContext !== 'closed' ? [{
        key: 'status',
        label: 'Status',
        value: filters.status,
        defaultValue: pageContext === 'commission' ? CommissionStatus.ALL : CashFlowStatus.ALL
    }] : []),
    // Currency Multi-select for Commission Page
    ...(pageContext === 'commission' && filters.selectedCurrencies && !filters.selectedCurrencies.includes('All') ? [{
        key: 'selectedCurrencies',
        label: 'Currency',
        value: filters.selectedCurrencies.length > 2 ? `${filters.selectedCurrencies.length} selected` : filters.selectedCurrencies.join(', '),
        defaultValue: ['All']
    }] : []),
    // Symbol & Direction for Positions & Closed (removed for commission)
    ...((pageContext === 'positions' || pageContext === 'closed') && filters.selectedSymbols && !filters.selectedSymbols.includes('All') ? [{
        key: 'selectedSymbols',
        label: 'Symbols',
        value: filters.selectedSymbols.length > 2 ? `${filters.selectedSymbols.length} Selected` : filters.selectedSymbols.join(', '),
        defaultValue: ['All'] // Uses default value 'All' to trigger chip display when not 'All'
    }] : []),
    ...((pageContext === 'positions' || pageContext === 'closed') && filters.direction !== 'All' ? [{
        key: 'direction',
        label: 'Direction',
        value: filters.direction,
        defaultValue: 'All'
    }] : []),
  ].filter(f => {
      // Custom check for array equality for selectedSymbols
      if (f.key === 'selectedSymbols') {
          return !filters.selectedSymbols.includes('All');
      }
      return f.value !== f.defaultValue;
  });

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 relative">
      <div className="flex flex-col xl:flex-row gap-4 justify-between">
        
        {/* Left Side: Search & Filter Button */}
        <div className="flex flex-col md:flex-row gap-3 flex-1">
          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Client, ID..." 
                className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          </div>

          {/* Filter Button & Dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                isFilterOpen || activeFilters.length > 0
                  ? 'border-primary-200 bg-primary-50 text-primary-700'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Filter size={16} />
              <span>Filter</span>
              {activeFilters.length > 0 && (
                <span className="bg-primary-600 text-white text-[10px] min-w-[1.25rem] h-5 flex items-center justify-center rounded-full px-1">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {/* Popover Menu */}
            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800">Filter Records</h3>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Relation / Tier View - Hide for Settlement Page */}
                  {pageContext !== 'settlement' && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{relationLabel}</label>
                      <div className="flex flex-wrap gap-2">
                        {relationOptions.map(val => (
                          <button
                            key={val}
                            onClick={() => setFilters(prev => ({ ...prev, relation: val }))}
                            className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                              filters.relation === val
                                ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status (Not for Positions, Closed, or Settlement) */}
                  {pageContext !== 'positions' && pageContext !== 'closed' && pageContext !== 'settlement' && (
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</label>
                        <div className="flex flex-wrap gap-2">
                        {statusOptions.map(val => (
                            <button
                            key={val}
                            onClick={() => setFilters(prev => ({ ...prev, status: val }))}
                            className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                                filters.status === val
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                            >
                            {val}
                            </button>
                        ))}
                        </div>
                    </div>
                  )}

                  {/* Currency Multi-select for Commission and Settlement Pages */}
                  {(pageContext === 'commission' || pageContext === 'settlement') && (
                    <div className="space-y-2" ref={currencyDropdownRef}>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Currency</label>
                        <div className="relative">
                            <button 
                                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-left"
                            >
                                <span className="truncate">
                                    {filters.selectedCurrencies?.includes('All') 
                                        ? 'All' 
                                        : `${filters.selectedCurrencies?.length || 0} selected`}
                                </span>
                                <ChevronDown size={14} className="text-slate-400" />
                            </button>
                            
                            {isCurrencyDropdownOpen && (
                                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                                    {CURRENCIES.map(currency => {
                                        const isSelected = filters.selectedCurrencies?.includes(currency);
                                        return (
                                            <div 
                                                key={currency} 
                                                onClick={() => toggleCurrency(currency)}
                                                className={`flex items-center px-3 py-2 cursor-pointer hover:bg-slate-50 text-sm ${isSelected ? 'text-primary-700 bg-primary-50' : 'text-slate-700'}`}
                                            >
                                                <div className={`w-4 h-4 mr-2 rounded border flex items-center justify-center ${isSelected ? 'bg-primary-600 border-primary-600' : 'border-slate-300 bg-white'}`}>
                                                    {isSelected && <Check size={10} className="text-white" />}
                                                </div>
                                                {currency === 'All' ? 'All' : currency}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                  )}

                  {/* Symbol Multi-select for Positions & Closed */}
                  {(pageContext === 'positions' || pageContext === 'closed') && (
                    <div className="space-y-2" ref={symbolDropdownRef}>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Trading Symbol</label>
                        <div className="relative">
                            <button 
                                onClick={() => setIsSymbolDropdownOpen(!isSymbolDropdownOpen)}
                                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-left"
                            >
                                <span className="truncate">
                                    {filters.selectedSymbols?.includes('All') 
                                        ? 'All' 
                                        : `${filters.selectedSymbols?.length} selected`}
                                </span>
                                <ChevronDown size={14} className="text-slate-400" />
                            </button>
                            
                            {isSymbolDropdownOpen && (
                                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                                    {TRADING_SYMBOLS.map(sym => {
                                        const isSelected = filters.selectedSymbols?.includes(sym);
                                        return (
                                            <div 
                                                key={sym} 
                                                onClick={() => toggleSymbol(sym)}
                                                className={`flex items-center px-3 py-2 cursor-pointer hover:bg-slate-50 text-sm ${isSelected ? 'text-primary-700 bg-primary-50' : 'text-slate-700'}`}
                                            >
                                                <div className={`w-4 h-4 mr-2 rounded border flex items-center justify-center ${isSelected ? 'bg-primary-600 border-primary-600' : 'border-slate-300 bg-white'}`}>
                                                    {isSelected && <Check size={10} className="text-white" />}
                                                </div>
                                                {sym}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                  )}

                  {/* Direction - For Positions & Closed */}
                  {(pageContext === 'positions' || pageContext === 'closed') && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Trading Direction</label>
                            <div className="flex gap-2">
                                {['All', 'Buy', 'Sell'].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setFilters(prev => ({ ...prev, direction: val }))}
                                        className={`flex-1 px-3 py-1.5 text-xs rounded-md border transition-all ${
                                            filters.direction === val
                                                ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        {val === 'All' ? 'All' : val === 'Buy' ? 'Buy' : 'Sell'}
                                    </button>
                                ))}
                            </div>
                        </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
                  <button 
                    onClick={clearAllFilters}
                    className="flex-1 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Date Filters & Export */}
        <div className="flex flex-col sm:flex-row items-center gap-3 border-t xl:border-t-0 border-slate-100 pt-3 xl:pt-0">
          
          {/* Date Range: Hide for Positions and Closed Pages */}
          {pageContext !== 'positions' && pageContext !== 'closed' && (
            <>
                <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
                    {Object.values(DateRangeOption).map((option) => (
                    <button
                        key={option}
                        onClick={() => handleDateRangeChange(option)}
                        className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                        filters.dateRange === option
                            ? 'bg-white text-primary-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {option}
                    </button>
                    ))}
                </div>

                {filters.dateRange === DateRangeOption.CUSTOM && (
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                    <input type="date" className="px-2 py-1.5 border border-slate-200 rounded-md text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <span className="text-slate-400">-</span>
                    <input type="date" className="px-2 py-1.5 border border-slate-200 rounded-md text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                )}
            </>
          )}

          <button 
            onClick={onExport}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm ml-auto xl:ml-0"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Active Filters Display Chips */}
      {activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 animation-fade-in">
          {activeFilters.map((f) => (
             <span key={f.key} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200">
                <span className="text-slate-500">{f.label}:</span>
                <span className="font-semibold text-slate-800">{f.value}</span>
                <button 
                  onClick={() => removeFilter(f.key as keyof FilterState, f.defaultValue)}
                  className="hover:bg-slate-300 rounded-full p-0.5 transition-colors ml-1 text-slate-500 hover:text-slate-700"
                >
                  <X size={12} />
                </button>
             </span>
          ))}
          <button 
             onClick={clearAllFilters}
             className="text-xs text-primary-600 hover:text-primary-700 font-medium hover:underline px-2 transition-colors"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
