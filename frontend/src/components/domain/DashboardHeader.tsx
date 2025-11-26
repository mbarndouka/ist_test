import React from 'react';
import { CreditCard, LogOut } from 'lucide-react';
import { Button } from '../ui';
import { User } from '../../types';

interface DashboardHeaderProps {
  user: User | null;
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-[#111111] text-white sticky top-0 z-40 border-b border-[#333]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#ccff00] rounded-lg flex items-center justify-center">
              <CreditCard className="text-black w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Procure<span className="text-[#ccff00]">Pay</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
            <span className="text-white cursor-pointer hover:text-[#ccff00] transition-colors">
              Dashboard
            </span>
            <span className="cursor-pointer hover:text-[#ccff00] transition-colors">
              Requests
            </span>
            <span className="cursor-pointer hover:text-[#ccff00] transition-colors">
              Reports
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right mr-2">
            <div className="text-sm font-medium text-white">{user?.username}</div>
            <div className="text-xs text-[#ccff00] uppercase tracking-wider font-bold">
              {user?.role}
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="bg-[#333] text-white border-[#444] hover:bg-[#444]"
            onClick={onLogout}
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
