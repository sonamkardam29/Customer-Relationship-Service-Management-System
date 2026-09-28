import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Search, Plus, Eye, LifeBuoy, AlertCircle } from 'lucide-react';

export const Tickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [customersList, setCustomersList] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    customer_id: '',
    subject: '',
    description: '',
    category: 'Technical',
    priority: 'Medium',
    status: 'Open',
    assigned_agent_id: ''
  });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        category: categoryFilter || undefined,
      };
      const response = await api.get('/tickets', { params });
      setTickets(response.data.items);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, search, statusFilter, priorityFilter, categoryFilter]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, uRes] = await Promise.all([
          api.get('/customers', { params: { limit: 100 } }),
          api.get('/users')
        ]);
        setCustomersList(cRes.data.items);
        setUsersList(uRes.data.filter(u => u.role === 'support_agent' || u.role === 'admin'));
      } catch (err) {
        console.error('Failed to load customers or agents:', err);
      }
    };
    fetchData();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.customer_id) {
      setFormError('Please select a valid Customer account');
      return;
    }
    try {
      await api.post('/tickets', {
        ...formData,
        customer_id: parseInt(formData.customer_id),
        assigned_agent_id: formData.assigned_agent_id ? parseInt(formData.assigned_agent_id) : (user?.role === 'support_agent' ? user.id : null)
      });
      setIsModalOpen(false);
      fetchTickets();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to create ticket');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-indigo-600" /> Service Ticket & Case Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Resolve banking customer technical inquiries, billing tickets, and support requests.
          </p>
        </div>

        <button
          onClick={() => { setFormError(''); setIsModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" /> Open New Ticket
        </button>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Customer">Pending Customer</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div>
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Billing">Billing</option>
            <option value="Account">Account</option>
            <option value="General">General</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Fetching service cases..." />
        ) : tickets.length === 0 ? (
          <EmptyState
            title="No service tickets found"
            description="No support tickets match your search parameters."
            actionLabel="Open New Ticket"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Case Subject & ID</th>
                  <th className="py-3 px-4">Customer Account</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Agent</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {tickets.map((tkt) => (
                  <tr key={tkt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <Link to={`/tickets/${tkt.id}`} className="font-semibold text-indigo-600 hover:underline">
                        #{tkt.id} - {tkt.subject}
                      </Link>
                      <p className="text-[11px] text-slate-400">Created: {new Date(tkt.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">{tkt.customer_name}</span>
                      <p className="text-[11px] text-slate-400">{tkt.customer_company || 'Individual'}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{tkt.category}</td>
                    <td className="py-3 px-4"><Badge value={tkt.priority} /></td>
                    <td className="py-3 px-4"><Badge value={tkt.status} /></td>
                    <td className="py-3 px-4 text-slate-600">{tkt.assigned_agent?.name || 'Unassigned'}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/tickets/${tkt.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={Math.ceil(total / limit) || 1}
          totalItems={total}
          limit={limit}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Create Ticket Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Open New Service Ticket">
        {formError && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {formError}
          </div>
        )}
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Select Customer Account *</label>
            <select
              required
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="">-- Choose Customer --</option>
              {customersList.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name} ({c.company || 'Individual'})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Ticket Subject *</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Detailed Problem Description *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="Technical">Technical</option>
                <option value="Billing">Billing</option>
                <option value="Account">Account</option>
                <option value="General">General</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Assign Support Agent</label>
            <select
              value={formData.assigned_agent_id}
              onChange={(e) => setFormData({ ...formData, assigned_agent_id: e.target.value })}
              className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="">Unassigned</option>
              {usersList.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              Open Ticket
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
