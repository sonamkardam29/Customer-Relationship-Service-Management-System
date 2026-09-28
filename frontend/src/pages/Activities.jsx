import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { CalendarCheck, Plus, CheckCircle2, Clock, Calendar, User, AlertCircle, Phone, Mail, Users, FileText } from 'lucide-react';

export const Activities = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [customersList, setCustomersList] = useState([]);
  const [formData, setFormData] = useState({
    activity_type: 'Call',
    subject: '',
    description: '',
    due_date: new Date().toISOString().slice(0, 16),
    status: 'Pending',
    customer_id: '',
    assigned_user_id: user?.id || ''
  });

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      };
      const response = await api.get('/activities', { params });
      setActivities(response.data.items);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [page, statusFilter, typeFilter]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/customers', { params: { limit: 100 } });
        setCustomersList(res.data.items);
      } catch (err) {
        console.error('Failed to load customers dropdown:', err);
      }
    };
    fetchCustomers();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/activities', {
        ...formData,
        customer_id: formData.customer_id ? parseInt(formData.customer_id) : null,
        assigned_user_id: user.id,
        due_date: new Date(formData.due_date).toISOString()
      });
      setIsModalOpen(false);
      fetchActivities();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to create activity');
    }
  };

  const toggleStatus = async (act) => {
    const newStatus = act.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await api.put(`/activities/${act.id}`, { status: newStatus });
      fetchActivities();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update activity status');
    }
  };

  const typeIcons = {
    Call: Phone,
    Email: Mail,
    Meeting: Users,
    'Follow-up': CalendarCheck,
    Demo: FileText,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-600" /> Customer Activities & Follow-ups
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track scheduled calls, emails, meetings, and client follow-up commitments.
          </p>
        </div>

        <button
          onClick={() => { setFormError(''); setIsModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" /> Schedule New Activity
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Activity Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Activity Types</option>
            <option value="Call">Call</option>
            <option value="Email">Email</option>
            <option value="Meeting">Meeting</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Demo">Demo</option>
          </select>
        </div>
      </div>

      {/* Activities Feed */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Fetching scheduled activities..." />
        ) : activities.length === 0 ? (
          <EmptyState
            title="No activities recorded"
            description="You currently have no scheduled follow-ups matching this filter."
            actionLabel="Schedule Activity"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {activities.map((act) => {
              const IconComp = typeIcons[act.activity_type] || Calendar;
              return (
                <div key={act.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleStatus(act)}
                      title={act.status === 'Completed' ? 'Mark as Pending' : 'Mark as Completed'}
                      className={`mt-0.5 p-1 rounded-full border transition-colors ${
                        act.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                          : 'bg-white text-slate-300 border-slate-300 hover:border-indigo-500'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{act.subject}</span>
                        <Badge value={act.status} />
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          <IconComp className="w-3 h-3" /> {act.activity_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {act.description || 'No additional notes provided.'}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono">
                        <span>Account: <strong className="text-slate-700 font-sans">{act.customer_name || act.lead_name || 'General'}</strong></span>
                        <span>• Assigned: <strong className="text-slate-700 font-sans">{act.assigned_user?.name || 'Unassigned'}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs font-mono text-slate-500 flex-shrink-0">
                    <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                    {act.due_date ? new Date(act.due_date).toLocaleString() : 'N/A'}
                  </div>
                </div>
              );
            })}
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

      {/* Schedule Activity Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule New Follow-up Activity">
        {formError && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {formError}
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Activity Type *</label>
              <select
                value={formData.activity_type}
                onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="Call">Call</option>
                <option value="Email">Email</option>
                <option value="Meeting">Meeting</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Demo">Demo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Due Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Subject / Goal *</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g. Executive Discovery Call"
              className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Link Customer Account</label>
            <select
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="">General / None</option>
              {customersList.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name} ({c.company || 'Individual'})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Description Notes</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
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
              Schedule Activity
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
