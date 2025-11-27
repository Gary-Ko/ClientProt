import React, { useEffect } from 'react';
import { X, Wallet, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils';
import { WalletItem } from '../types';

interface WalletDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  totalAmount: number;
  walletData: WalletItem[];
}

const WalletDrawer: React.FC<WalletDrawerProps> = ({ isOpen, onClose, title, totalAmount, walletData }) => {
  // Prevent body scroll when drawer is open
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity opacity-100"
        onClick={onClose}
      ></div>

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Wallet className="text-primary-600" size={24} />
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Total Summary */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-lg shadow-primary-500/20">
            <p className="text-primary-100 text-sm font-medium mb-1">Total Amount</p>
            <h3 className="text-3xl font-bold">{formatCurrency(totalAmount)}</h3>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-primary-100">
              <span>Updated just now</span>
              <span>USD Equivalent</span>
            </div>
          </div>

          {/* Wallet List */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Currency Breakdown</h3>
            <div className="space-y-3">
              {walletData.map((wallet) => (
                <div key={wallet.currency} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${wallet.color}`}>
                      {wallet.currency.substring(0, 1)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{wallet.currency} Wallet</p>
                      {wallet.displayAmount && (
                         <p className="text-xs text-slate-500">{wallet.displayAmount}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-700">{formatCurrency(wallet.amount)}</p>
                    <div className="flex items-center justify-end gap-1 text-xs text-primary-600 font-medium cursor-pointer hover:underline mt-0.5">
                      Details <ArrowRight size={10} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletDrawer;
