import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Target,
  CalendarCheck,
  LifeBuoy,
  BarChart3,
  ShieldCheck,
  Building
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'sales_executive', 'support_agent'] },
    { label: 'Customers', path: '/customers', icon: Building, roles: ['admin', 'sales_executive', 'support_agent'] },
    { label: 'Leads Pipeline', path: '/leads', icon: Target, roles: ['admin', 'sales_executive'] },
    { label: 'Activities & Follow-ups', path: '/activities', icon: CalendarCheck, roles: ['admin', 'sales_executive', 'support_agent'] },
    { label: 'Service Tickets', path: '/tickets', icon: LifeBuoy, roles: ['admin', 'sales_executive', 'support_agent'] },
    { label: 'Analytics & Reports', path: '/reports', icon: BarChart3, roles: ['admin', 'sales_executive', 'support_agent'] },
    { label: 'User Roster', path: '/users', icon: ShieldCheck, roles: ['admin'] },
  ];

  const allowedItems = navItems.filter(item => !user || item.roles.includes(user.role));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold shadow-md">
            CR
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">Apex Banking CRM</h1>
            <p className="text-[10px] text-slate-400 font-mono">Service Hub v1.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Modules
        </div>
        {allowedItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / System Status */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>System Online</span>
        </div>
      </div>
    </aside>
  );
};
