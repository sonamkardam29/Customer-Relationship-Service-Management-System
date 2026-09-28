import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import {
  Users,
  Target,
  CheckCircle2,
  TrendingUp,
  LifeBuoy,
  AlertTriangle,
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#6366f1', '#0ea5e9', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];

export const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard');
        setData(response.data);
      } catch (err) {
        console.error("Dashboard load failed:", err);
        setError("Failed to load dashboard metrics from backend.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner label="Fetching CRM database metrics..." />;
  if (error) return <div className="p-4 bg-rose-50 text-rose-700 rounded-xl">{error}</div>;

  const { kpis, leads_by_status, tickets_by_priority, tickets_by_status, customer_growth, recent_activities } = data;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex items-center justify-between border border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-indigo-400 font-mono font-semibold">
            Enterprise Banking Portal
          </span>
          <h1 className="text-2xl font-bold mt-1">Welcome back, {user?.name}</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time insights across customer accounts, sales pipelines, follow-ups, and support cases.
          </p>
        </div>
        <div className="hidden sm:flex gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <span className="block text-xs text-slate-300">Role</span>
            <span className="text-sm font-semibold capitalize">{user?.role?.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Customers</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{kpis.total_customers}</p>
            <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="w-3 h-3" /> Active Enterprise Portfolio
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Leads & Converted */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Leads</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{kpis.total_leads}</p>
            <p className="text-[11px] text-teal-600 flex items-center gap-1 mt-1 font-medium">
              <CheckCircle2 className="w-3 h-3" /> {kpis.converted_leads} Converted ({kpis.total_leads > 0 ? Math.round((kpis.converted_leads / kpis.total_leads) * 100) : 0}%)
            </p>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Target className="w-6 h-6" />
          </div>
        </div>

        {/* Open Tickets */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Open Service Tickets</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{kpis.open_tickets}</p>
            <p className="text-[11px] text-amber-600 flex items-center gap-1 mt-1 font-medium">
              <LifeBuoy className="w-3 h-3" /> {kpis.resolved_tickets} Resolved Cases
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <LifeBuoy className="w-6 h-6" />
          </div>
        </div>

        {/* High Priority Tickets */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Critical/High Tickets</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{kpis.high_priority_tickets}</p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 font-medium">
              Requires Agent Attention
            </p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Pipeline Stage Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center justify-between">
            <span>Leads by Pipeline Status</span>
            <span className="text-xs font-normal text-slate-500">Live SQL Query</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leads_by_status} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tickets Priority Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center justify-between">
            <span>Tickets by Priority</span>
            <span className="text-xs font-normal text-slate-500">Case Distribution</span>
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tickets_by_priority}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {tickets_by_priority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Portfolio Growth */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Customer Portfolio Growth
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={customer_growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Follow-ups & Activities List */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" /> Recent Activities & Follow-ups
            </span>
            <span className="text-xs text-indigo-600 font-medium">Live Feed</span>
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {recent_activities.map((act) => (
              <div key={act.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{act.subject}</span>
                    <Badge value={act.status} />
                  </div>
                  <p className="text-slate-500 mt-1">
                    {act.type} • {act.customer_name} • Assigned: {act.assigned_user}
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 font-mono flex-shrink-0 ml-2">
                  {act.due_date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
