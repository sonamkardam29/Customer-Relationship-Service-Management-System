import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { LogOut, User as UserIcon, Building2 } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  const roleLabels = {
    admin: 'System Administrator',
    sales_executive: 'Sales Executive',
    support_agent: 'Support Specialist',
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-xs shadow-xs">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span>Financial Services & Banking Edition</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-900">{user.name}</span>
              <span className="text-[11px] text-slate-500">{user.email}</span>
            </div>

            <Badge value={user.role} label={roleLabels[user.role] || user.role} />

            <button
              onClick={logout}
              title="Sign out of CRM"
              className="ml-2 flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
