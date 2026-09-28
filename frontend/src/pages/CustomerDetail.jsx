import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  UserCheck,
  LifeBuoy,
  Target,
  CalendarCheck,
  Plus,
  ArrowLeft,
  Clock,
  AlertCircle
} from 'lucide-react';

export const CustomerDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tickets');

  // Quick Action Modals
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [modalError, setModalError] = useState('');

  // Ticket Form State
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    category: 'Technical',
    priority: 'Medium',
    status: 'Open'
  });

  // Activity Form State
  const [activityForm, setActivityForm] = useState({
    activity_type: 'Call',
    subject: '',
    description: '',
    due_date: new Date().toISOString().slice(0, 16),
    status: 'Pending'
  });

  const fetchCustomer360 = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/customers/${id}/360`);
      setData(response.data);
    } catch (err) {
      console.error('Customer 360 fetch error:', err);
      setError('Failed to load customer profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer360();
  }, [id]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      await api.post('/tickets', {
        ...ticketForm,
        customer_id: parseInt(id)
      });
      setIsTicketModalOpen(false);
      setTicketForm({ subject: '', description: '', category: 'Technical', priority: 'Medium', status: 'Open' });
      fetchCustomer360();
    } catch (err) {
      setModalError(err.response?.data?.detail || 'Failed to create service ticket');
    }
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      await api.post('/activities', {
        ...activityForm,
        customer_id: parseInt(id),
        due_date: new Date(activityForm.due_date).toISOString()
      });
      setIsActivityModalOpen(false);
      setActivityForm({ activity_type: 'Call', subject: '', description: '', due_date: new Date().toISOString().slice(0, 16), status: 'Pending' });
      fetchCustomer360();
    } catch (err) {
      setModalError(err.response?.data?.detail || 'Failed to log activity');
    }
  };

  if (loading) return <LoadingSpinner label="Compiling Customer 360 Profile..." />;
  if (error || !data) return <div className="p-4 bg-rose-50 text-rose-700 rounded-xl">{error || 'Customer not found'}</div>;

  const { customer, leads, tickets, activities } = data;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/customers" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Customer Portfolio
      </Link>

      {/* Customer Header 360 Profile Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl shadow-xs">
              {customer.company ? customer.company.slice(0, 2).toUpperCase() : customer.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900">{customer.full_name}</h1>
                <Badge value={customer.status} />
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {customer.customer_type}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                <Building2 className="w-3.5 h-3.5" /> {customer.company || 'Enterprise Account'} • <Briefcase className="w-3.5 h-3.5" /> {customer.industry || 'Financial Services'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setModalError(''); setIsTicketModalOpen(true); }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" /> Create Ticket
            </button>
            <button
              onClick={() => { setModalError(''); setIsActivityModalOpen(true); }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" /> Log Activity
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-600 pt-1">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Email</span>
              <span className="font-mono text-slate-800">{customer.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" />
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Phone</span>
              <span className="text-slate-800">{customer.phone || 'N/A'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Location</span>
              <span className="text-slate-800">{customer.location || 'Global'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-slate-400" />
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Account Manager</span>
              <span className="font-medium text-slate-800">{customer.assigned_sales?.name || 'Unassigned'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 360 Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'tickets'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LifeBuoy className="w-4 h-4" /> Service Tickets ({tickets.length})
          </button>

          <button
            onClick={() => setActiveTab('activities')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'activities'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarCheck className="w-4 h-4" /> Activity History ({activities.length})
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'leads'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Target className="w-4 h-4" /> Associated Leads ({leads.length})
          </button>
        </nav>
      </div>

      {/* Tab Content Panels */}
      {activeTab === 'tickets' && (
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
              No service tickets recorded for this customer.
            </div>
          ) : (
            tickets.map((tkt) => (
              <div key={tkt.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Link to={`/tickets/${tkt.id}`} className="text-sm font-semibold text-indigo-600 hover:underline">
                      #{tkt.id} - {tkt.subject}
                    </Link>
                    <Badge value={tkt.priority} />
                    <Badge value={tkt.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Category: {tkt.category} • Agent: {tkt.assigned_agent}
                  </p>
                </div>
                <Link
                  to={`/tickets/${tkt.id}`}
                  className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors self-start md:self-auto"
                >
                  View Case Timeline
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
              No interactions or follow-up activities recorded yet.
            </div>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{act.subject}</span>
                    <Badge value={act.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {act.type} • Assigned: {act.assigned_user}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 inline mr-1" />
                  {act.due_date ? new Date(act.due_date).toLocaleString() : 'N/A'}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="space-y-3">
          {leads.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
              No linked sales opportunities.
            </div>
          ) : (
            leads.map((lead) => (
              <div key={lead.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{lead.name} ({lead.company})</span>
                    <Badge value={lead.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Lead Score: <span className="font-semibold text-teal-600">{lead.score}/100</span>
                  </p>
                </div>
                <Link
                  to={`/leads/${lead.id}`}
                  className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  View Lead Details
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {/* Quick Ticket Creation Modal */}
      <Modal isOpen={isTicketModalOpen} onClose={() => setIsTicketModalOpen(false)} title="Open New Service Ticket">
        {modalError && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {modalError}
          </div>
        )}
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Subject *</label>
            <input
              type="text"
              required
              value={ticketForm.subject}
              onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
              className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Description *</label>
            <textarea
              required
              rows={3}
              value={ticketForm.description}
              onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
              className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Category</label>
              <select
                value={ticketForm.category}
                onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
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
              <label className="block text-xs font-semibold text-slate-700">Priority</label>
              <select
                value={ticketForm.priority}
                onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsTicketModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Activity Creation Modal */}
      <Modal isOpen={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)} title="Log Follow-up Activity">
        {modalError && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {modalError}
          </div>
        )}
        <form onSubmit={handleCreateActivity} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Activity Type</label>
              <select
                value={activityForm.activity_type}
                onChange={(e) => setActivityForm({ ...activityForm, activity_type: e.target.value })}
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
                value={activityForm.due_date}
                onChange={(e) => setActivityForm({ ...activityForm, due_date: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Subject *</label>
            <input
              type="text"
              required
              value={activityForm.subject}
              onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })}
              className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Description</label>
            <textarea
              rows={2}
              value={activityForm.description}
              onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
              className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsActivityModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              Log Activity
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
