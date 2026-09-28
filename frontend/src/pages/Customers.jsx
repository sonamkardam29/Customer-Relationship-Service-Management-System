import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Search, Plus, Edit2, Trash2, Eye, Building2, Filter, AlertCircle } from 'lucide-react';

export const Customers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [search, setSearch] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState([]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    location: '',
    customer_type: 'Enterprise',
    status: 'Active',
    assigned_sales_id: ''
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search || undefined,
        customer_type: customerType || undefined,
        status: statusFilter || undefined,
      };
      const response = await api.get('/customers', { params });
      setCustomers(response.data.items);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search, customerType, statusFilter]);

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
      full_name: '',
      email: '',
      phone: '',
      company: '',
      industry: '',
      location: '',
      customer_type: 'Enterprise',
      status: 'Active',
      assigned_sales_id: user?.id || ''
    });
    setFormError('');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/customers', {
        ...formData,
        assigned_sales_id: formData.assigned_sales_id ? parseInt(formData.assigned_sales_id) : null
      });
      setIsAddModalOpen(false);
      resetForm();
      fetchCustomers();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to create customer');
    }
  };

  const handleEditClick = (cust) => {
    setSelectedCustomer(cust);
    setFormData({
      full_name: cust.full_name,
      email: cust.email,
      phone: cust.phone || '',
      company: cust.company || '',
      industry: cust.industry || '',
      location: cust.location || '',
      customer_type: cust.customer_type || 'Enterprise',
      status: cust.status || 'Active',
      assigned_sales_id: cust.assigned_sales_id || ''
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.put(`/customers/${selectedCustomer.id}`, {
        ...formData,
        assigned_sales_id: formData.assigned_sales_id ? parseInt(formData.assigned_sales_id) : null
      });
      setIsEditModalOpen(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to update customer');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer record?')) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete customer record');
    }
  };

  const canEdit = ['admin', 'sales_executive'].includes(user?.role);
  const canDelete = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" /> Customer Accounts Portfolio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage enterprise banking customers, account parameters, and sales assignments.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New Customer
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, company, email, location..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        <div>
          <select
            value={customerType}
            onChange={(e) => { setCustomerType(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-700 bg-white"
          >
            <option value="">All Customer Types</option>
            <option value="Enterprise">Enterprise</option>
            <option value="SMB">SMB</option>
            <option value="Retail">Retail</option>
            <option value="VIP">VIP</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-700 bg-white"
          >
            <option value="">All Account Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Loading customer accounts..." />
        ) : customers.length === 0 ? (
          <EmptyState
            title="No customers match your query"
            description="Try changing your search terms or filter selections."
            actionLabel={canEdit ? "Add Customer" : undefined}
            onAction={canEdit ? () => { resetForm(); setIsAddModalOpen(true); } : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Customer Name & Company</th>
                  <th className="py-3 px-4">Contact Email</th>
                  <th className="py-3 px-4">Industry & Location</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Sales</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <Link to={`/customers/${cust.id}`} className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">
                        {cust.full_name}
                      </Link>
                      <p className="text-[11px] text-slate-500">{cust.company || 'Individual Account'}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{cust.email}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">{cust.industry || 'Banking'}</span>
                      <p className="text-[11px] text-slate-400">{cust.location || 'Global'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {cust.customer_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge value={cust.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {cust.assigned_sales?.name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        to={`/customers/${cust.id}`}
                        title="Customer 360 View"
                        className="inline-flex items-center p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {canEdit && (
                        <button
                          onClick={() => handleEditClick(cust)}
                          title="Edit Customer"
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(cust.id)}
                          title="Delete Customer"
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

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
        title={isAddModalOpen ? 'Create New Customer Account' : 'Edit Customer Account'}
      >
        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Full Name *</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Corporate Email *</label>
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
              <label className="block text-xs font-semibold text-slate-700">Industry Segment</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="Investment Banking, Wealth Management, Retail..."
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Location / Head Office</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="New York, London, Zurich..."
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Customer Tier/Type</label>
              <select
                value={formData.customer_type}
                onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Enterprise">Enterprise</option>
                <option value="SMB">SMB</option>
                <option value="Retail">Retail</option>
                <option value="VIP">VIP</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Account Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Assigned Sales Executive</label>
            <select
              value={formData.assigned_sales_id}
              onChange={(e) => setFormData({ ...formData, assigned_sales_id: e.target.value })}
              className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
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
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              {isAddModalOpen ? 'Save Customer' : 'Update Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
