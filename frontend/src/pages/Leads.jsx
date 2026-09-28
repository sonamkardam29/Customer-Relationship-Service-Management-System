import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Search, Plus, Edit2, Trash2, Eye, Target, ArrowRightLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Leads = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [formError, setFormError] = useState('');

  // Lead Form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website',
    industry: '',
    lead_status: 'New',
    lead_score: 50,
    expected_conversion_date: '',
    assigned_sales_id: ''
  });

  // Convert Form
  const [convertData, setConvertData] = useState({
    customer_type: 'Enterprise',
    industry: '',
    location: ''
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
        source: sourceFilter || undefined,
      };
      const response = await api.get('/leads', { params });
      setLeads(response.data.items);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, search, statusFilter, sourceFilter]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsersList(res.data);
      } catch (err) {
        console.error('Failed to fetch users list:', err);
      }
    };
    fetchUsers();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      source: 'Website',
      industry: '',
      lead_status: 'New',
      lead_score: 50,
      expected_conversion_date: '',
      assigned_sales_id: user?.id || ''
    });
    setFormError('');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/leads', {
        ...formData,
        lead_score: parseInt(formData.lead_score),
        assigned_sales_id: formData.assigned_sales_id ? parseInt(formData.assigned_sales_id) : null,
        expected_conversion_date: formData.expected_conversion_date || null
      });
      setIsAddModalOpen(false);
      resetForm();
      fetchLeads();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to create lead');
    }
  };

  const handleEditClick = (lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company || '',
      source: lead.source || 'Website',
      industry: lead.industry || '',
      lead_status: lead.lead_status || 'New',
      lead_score: lead.lead_score || 50,
      expected_conversion_date: lead.expected_conversion_date || '',
      assigned_sales_id: lead.assigned_sales_id || ''
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.put(`/leads/${selectedLead.id}`, {
        ...formData,
        lead_score: parseInt(formData.lead_score),
        assigned_sales_id: formData.assigned_sales_id ? parseInt(formData.assigned_sales_id) : null,
        expected_conversion_date: formData.expected_conversion_date || null
      });
      setIsEditModalOpen(false);
      setSelectedLead(null);
      fetchLeads();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to update lead');
    }
  };

  const handleConvertClick = (lead) => {
    setSelectedLead(lead);
    setConvertData({
      customer_type: 'Enterprise',
      industry: lead.industry || 'Financial Services',
      location: 'New York, USA'
    });
    setFormError('');
    setIsConvertModalOpen(true);
  };

  const handleConvertSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post(`/leads/${selectedLead.id}/convert`, convertData);
      setIsConvertModalOpen(false);
      setSelectedLead(null);
      fetchLeads();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to convert lead');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete lead record?')) return;
    try {
      await api.delete(`/leads/${id}`);
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete lead');
    }
  };

  const canEdit = ['admin', 'sales_executive'].includes(user?.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" /> Sales Opportunities & Lead Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track lead progression from New prospect to Converted enterprise customer.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Create New Lead
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by name, email, company..."
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
            <option value="">All Pipeline Stages</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal">Proposal</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        <div>
          <select
            value={sourceFilter}
            onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Lead Sources</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Event">Event</option>
            <option value="Cold Call">Cold Call</option>
            <option value="Partner">Partner</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Fetching sales leads..." />
        ) : leads.length === 0 ? (
          <EmptyState
            title="No leads found"
            description="No sales opportunities match your active filters."
            actionLabel={canEdit ? "Create Lead" : undefined}
            onAction={canEdit ? () => { resetForm(); setIsAddModalOpen(true); } : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Lead Name & Company</th>
                  <th className="py-3 px-4">Pipeline Status</th>
                  <th className="py-3 px-4">Lead Score</th>
                  <th className="py-3 px-4">Source & Industry</th>
                  <th className="py-3 px-4">Assigned Sales</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <Link to={`/leads/${lead.id}`} className="font-semibold text-indigo-600 hover:underline">
                        {lead.name}
                      </Link>
                      <p className="text-[11px] text-slate-500">{lead.company || 'Private Account'} • {lead.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge value={lead.lead_status} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${lead.lead_score >= 80 ? 'bg-emerald-500' : lead.lead_score >= 60 ? 'bg-teal-500' : 'bg-amber-500'}`}
                            style={{ width: `${lead.lead_score}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-600 font-semibold">{lead.lead_score}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">{lead.source}</span>
                      <p className="text-[11px] text-slate-400">{lead.industry || 'Banking'}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {lead.assigned_sales?.name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {lead.lead_status !== 'Converted' && canEdit && (
                        <button
                          onClick={() => handleConvertClick(lead)}
                          title="Convert Lead to Customer Account"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-[11px] font-semibold rounded-md transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Convert
                        </button>
                      )}
                      <Link
                        to={`/leads/${lead.id}`}
                        title="View Lead Details"
                        className="inline-flex items-center p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {canEdit && (
                        <button
                          onClick={() => handleEditClick(lead)}
                          title="Edit Lead"
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {canEdit && (
                        <button
                          onClick={() => handleDelete(lead.id)}
                          title="Delete Lead"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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

      {/* Add / Edit Lead Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
        title={isAddModalOpen ? 'Create New Sales Lead' : 'Edit Lead Information'}
      >
        {formError && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {formError}
          </div>
        )}

        <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Lead Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Company Name</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Event">Event</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Partner">Partner</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Pipeline Status</label>
              <select
                value={formData.lead_status}
                onChange={(e) => setFormData({ ...formData, lead_status: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal">Proposal</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Lead Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.lead_score}
                onChange={(e) => setFormData({ ...formData, lead_score: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Expected Conversion Date</label>
              <input
                type="date"
                value={formData.expected_conversion_date}
                onChange={(e) => setFormData({ ...formData, expected_conversion_date: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Assigned Sales Executive</label>
            <select
              value={formData.assigned_sales_id}
              onChange={(e) => setFormData({ ...formData, assigned_sales_id: e.target.value })}
              className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
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
              onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              {isAddModalOpen ? 'Save Lead' : 'Update Lead'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Convert Lead Modal */}
      <Modal isOpen={isConvertModalOpen} onClose={() => setIsConvertModalOpen(false)} title="Convert Lead to Enterprise Customer Account">
        {formError && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {formError}
          </div>
        )}
        <form onSubmit={handleConvertSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Converting lead <span className="font-bold text-slate-900">{selectedLead?.name}</span> ({selectedLead?.company}) will create an active Customer record in the database and update this lead stage to <Badge value="Converted" />.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Customer Tier/Type</label>
              <select
                value={convertData.customer_type}
                onChange={(e) => setConvertData({ ...convertData, customer_type: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="Enterprise">Enterprise</option>
                <option value="SMB">SMB</option>
                <option value="Retail">Retail</option>
                <option value="VIP">VIP</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Industry Segment</label>
              <input
                type="text"
                value={convertData.industry}
                onChange={(e) => setConvertData({ ...convertData, industry: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Location / Head Office</label>
            <input
              type="text"
              value={convertData.location}
              onChange={(e) => setConvertData({ ...convertData, location: e.target.value })}
              className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsConvertModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              Execute Conversion
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
