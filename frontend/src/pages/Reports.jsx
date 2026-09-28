import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { BarChart3, Filter, PieChart as PieIcon, CheckCircle2, Target, LifeBuoy, CalendarCheck } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#6366f1', '#0ea5e9', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6'];

export const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [assignedUserFilter, setAssignedUserFilter] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {
        assigned_user_id: assignedUserFilter || undefined
      };
      const response = await api.get('/reports', { params });
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load analytical reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [assignedUserFilter]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsersList(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <LoadingSpinner label="Generating analytical reports..." />;
  if (error || !data) return <div className="p-4 bg-rose-50 text-rose-700 rounded-xl">{error}</div>;

  const { lead_conversion, customer_acquisition, ticket_resolution, sales_activity } = data;

  return (
    <div className="space-y-6">
      {/* Header & Employee Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" /> Executive Reports & Operational Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated business intelligence for sales conversions, customer distribution, and case resolutions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={assignedUserFilter}
            onChange={(e) => setAssignedUserFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Employees / Organization-wide</option>
            {usersList.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Lead Conversion Rate</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{lead_conversion.conversion_rate}%</p>
          <p className="text-[11px] text-slate-500 mt-1">{lead_conversion.converted_leads} / {lead_conversion.total_leads} Total Leads</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Ticket Resolution SLA</p>
          <p className="text-2xl font-bold text-teal-600 mt-1">{ticket_resolution.resolution_rate}%</p>
          <p className="text-[11px] text-slate-500 mt-1">{ticket_resolution.resolved_tickets} / {ticket_resolution.total_tickets} Cases Closed</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Acquired Industries</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{customer_acquisition.by_industry.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Banking Segments Covered</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Logged Sales Activities</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {sales_activity.by_type.reduce((acc, curr) => acc + curr.count, 0)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Total Client Touches</p>
        </div>
      </div>

      {/* Report Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by Source */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center justify-between">
            <span>Lead Generation by Acquisition Source</span>
            <Target className="w-4 h-4 text-indigo-600" />
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lead_conversion.by_source}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="source" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tickets by Category */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center justify-between">
            <span>Service Cases by Category</span>
            <LifeBuoy className="w-4 h-4 text-teal-600" />
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ticket_resolution.by_category}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="category"
                  label={({ category, count }) => `${category}: ${count}`}
                >
                  {ticket_resolution.by_category.map((entry, index) => (
                    <Cell key={`cat-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Breakdown by Industry */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Customer Distribution by Industry Segment
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customer_acquisition.by_industry} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="industry" type="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activities by Type */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center justify-between">
            <span>Activities by Communication Channel</span>
            <CalendarCheck className="w-4 h-4 text-amber-600" />
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sales_activity.by_type}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
