
import React, { useState, useMemo } from 'react';
import { FilterState, ClientRelation, CommissionStatus, CashFlowStatus, DateRangeOption, SettlementReport, PageContext } from './types';
import { MOCK_METRICS, MOCK_DETAILS, MOCK_SETTLEMENTS, MOCK_WALLETS_TOTAL, MOCK_WALLETS_SETTLED, MOCK_WALLETS_PENDING, MOCK_CLIENTS, MOCK_CASH_FLOW_METRICS, MOCK_CASH_FLOW_DATA, MOCK_POSITIONS_METRICS, MOCK_OPEN_POSITIONS } from './constants';
import FilterBar from './components/FilterBar';
import MetricsOverview from './components/MetricsOverview';
import ChartsSection from './components/ChartsSection';
import DataTable from './components/DataTable';
import WalletDrawer from './components/WalletDrawer';
import CommissionDrawer from './components/CommissionDrawer';
import { LayoutDashboard, WalletCards, CandlestickChart } from 'lucide-react';

const App: React.FC = () => {
  // Page State
  const [activePage, setActivePage] = useState<PageContext>('commission');

  const [filters, setFilters] = useState<FilterState>({
    relation: ClientRelation.ALL,
    symbol: 'All',
    selectedSymbols: ['All'],
    status: CommissionStatus.ALL, // Initial status
    dateRange: DateRangeOption.THIS_MONTH
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'summary' | 'clients'>('summary');
  
  // State for Wallet Drawer
  const [walletDrawerType, setWalletDrawerType] = useState<'total' | 'settled' | 'pending' | null>(null);

  // State for Commission Details Drawer
  const [selectedSettlement, setSelectedSettlement] = useState<SettlementReport | null>(null);

  const handlePageChange = (page: PageContext) => {
    setActivePage(page);
    // Reset filters appropriate for the new page context
    setFilters({
      relation: ClientRelation.ALL,
      symbol: 'All',
      selectedSymbols: ['All'],
      direction: 'All',
      status: page === 'commission' ? CommissionStatus.ALL : page === 'cashflow' ? CashFlowStatus.ALL : 'All',
      dateRange: DateRangeOption.THIS_MONTH
    });
    setSearchTerm('');
  };

  const handleExport = () => {
    const now = new Date();
    const formattedDate = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14); // YYYYMMDDHHMMSS
    const reportType = activePage === 'commission' ? 'CommissionReport' : activePage === 'cashflow' ? 'CashFlowReport' : 'OpenPositionsReport';
    const filename = `${reportType}_${formattedDate}.csv`;

    const csvContent = "data:text/csv;charset=utf-8,ID,Date,Amount,Status\n" 
      + "1, 2023-10-01, 500, Completed";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Logic for Settlements (Commission View 1)
  const filteredSettlements = useMemo(() => {
    return MOCK_SETTLEMENTS.filter(s => {
      const matchesSearch = s.settlementNo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filters.status === CommissionStatus.ALL || s.status === filters.status;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filters]);

  // Filter Logic for Clients (Commission View 2)
  const filteredClients = useMemo(() => {
    return MOCK_CLIENTS.filter(c => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        c.clientId.toLowerCase().includes(term) || 
        c.clientName.toLowerCase().includes(term);
      
      const matchesRelation = filters.relation === ClientRelation.ALL || c.identity === filters.relation;
      
      return matchesSearch && matchesRelation;
    });
  }, [searchTerm, filters]);

  // Filter Logic for Cash Flow
  const filteredCashFlow = useMemo(() => {
    if (activePage !== 'cashflow') return [];
    return MOCK_CASH_FLOW_DATA.filter(cf => {
        const term = searchTerm.toLowerCase();
        // Search client name or account ID or transaction no
        const matchesSearch = 
            cf.clientName.toLowerCase().includes(term) || 
            cf.accountId.toLowerCase().includes(term) ||
            cf.transactionNo.toLowerCase().includes(term);

        // Status filter (using CashFlowStatus enum)
        const matchesStatus = filters.status === CashFlowStatus.ALL || cf.status === filters.status;

        // Relation filter (using ClientRelation mapped to Tier View)
        // MOCK data has 'Direct' or 'Agent' as sourceType
        const matchesRelation = filters.relation === ClientRelation.ALL || cf.sourceType === filters.relation;

        return matchesSearch && matchesStatus && matchesRelation;
    });
  }, [activePage, searchTerm, filters]);

  // Filter Logic for Open Positions
  const filteredPositions = useMemo(() => {
    if (activePage !== 'positions') return [];
    return MOCK_OPEN_POSITIONS.filter(pos => {
        const term = searchTerm.toLowerCase();
        // 1. Client Search
        const matchesSearch = 
            pos.clientName.toLowerCase().includes(term) || 
            pos.accountId.toLowerCase().includes(term);
        
        // 2. Symbol (Multi-select)
        const matchesSymbol = filters.selectedSymbols.includes('All') || filters.selectedSymbols.includes(pos.symbol);

        // 3. Direction
        const matchesDirection = filters.direction === 'All' || pos.direction === filters.direction;

        // 4. Tier View
        const matchesRelation = filters.relation === ClientRelation.ALL || pos.sourceType === filters.relation;

        return matchesSearch && matchesSymbol && matchesDirection && matchesRelation;
    });
  }, [activePage, searchTerm, filters]);

  // Determine Wallet Drawer Data
  const walletDrawerData = useMemo(() => {
    if (walletDrawerType === 'total') {
        return {
            title: 'Est. Total Commission',
            total: MOCK_METRICS.totalCommission,
            data: MOCK_WALLETS_TOTAL
        };
    } else if (walletDrawerType === 'settled') {
        return {
            title: 'Est. Settled Commission',
            total: MOCK_METRICS.settledAmount,
            data: MOCK_WALLETS_SETTLED
        };
    } else if (walletDrawerType === 'pending') {
        return {
            title: 'Est. Pending Commission',
            total: MOCK_METRICS.pendingAmount,
            data: MOCK_WALLETS_PENDING
        };
    }
    return { title: '', total: 0, data: [] };
  }, [walletDrawerType]);

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
                {/* Logo Area */}
                <div className="flex items-center gap-3">
                    <div className="bg-primary-600 p-2 rounded-lg shadow-sm">
                        <LayoutDashboard className="text-white" size={20} />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight hidden md:block">Commission Pro</h1>
                </div>

                {/* Navigation Tabs */}
                <nav className="flex space-x-1">
                    <button
                        onClick={() => handlePageChange('commission')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                            activePage === 'commission' 
                            ? 'bg-slate-100 text-primary-700' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <LayoutDashboard size={18} />
                        Commission Report
                    </button>
                    <button
                        onClick={() => handlePageChange('cashflow')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                            activePage === 'cashflow' 
                            ? 'bg-slate-100 text-primary-700' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <WalletCards size={18} />
                        Client Cash Flow
                    </button>
                    <button
                        onClick={() => handlePageChange('positions')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                            activePage === 'positions' 
                            ? 'bg-slate-100 text-primary-700' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <CandlestickChart size={18} />
                        Open Positions
                    </button>
                </nav>
            </div>

            <div className="flex items-center gap-4">
               <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-800">Admin User</span>
                  <span className="text-xs text-slate-500">Super Administrator</span>
               </div>
               <div className="h-9 w-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold border-2 border-white shadow-sm ring-1 ring-slate-100">
                  AD
               </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Section 1: Filters */}
        <section>
          <FilterBar 
            filters={filters} 
            setFilters={setFilters} 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onExport={handleExport}
            pageContext={activePage}
          />
        </section>

        {/* Section 2: Metrics */}
        <section>
          <MetricsOverview 
            metrics={activePage === 'commission' ? MOCK_METRICS : activePage === 'cashflow' ? MOCK_CASH_FLOW_METRICS : MOCK_POSITIONS_METRICS} 
            pageContext={activePage}
            onTotalClick={() => setWalletDrawerType('total')}
            onSettledClick={() => setWalletDrawerType('settled')}
            onPendingClick={() => setWalletDrawerType('pending')}
          />
        </section>

        {/* Section 3: Charts */}
        <section>
          <ChartsSection pageContext={activePage} />
        </section>

        {/* Section 4: Data Table */}
        <section id="data-table-section">
          <DataTable 
            viewMode={viewMode} 
            setViewMode={setViewMode} 
            settlementData={filteredSettlements}
            clientData={filteredClients}
            cashFlowData={filteredCashFlow}
            openPositionsData={filteredPositions}
            onViewSettlement={(settlement) => setSelectedSettlement(settlement)}
            pageContext={activePage}
          />
        </section>

      </main>

      {/* Wallet Drawer (Right Slide) - Only relevant for Commission Page Metrics */}
      <WalletDrawer 
        isOpen={!!walletDrawerType} 
        onClose={() => setWalletDrawerType(null)}
        title={walletDrawerData.title}
        totalAmount={walletDrawerData.total}
        walletData={walletDrawerData.data}
      />

      {/* Commission Details Drawer (Right Slide) */}
      <CommissionDrawer 
        isOpen={!!selectedSettlement}
        onClose={() => setSelectedSettlement(null)}
        settlement={selectedSettlement}
        allDetails={MOCK_DETAILS}
      />
    </div>
  );
};

export default App;
