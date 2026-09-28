import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ShieldCheck, Plus, Edit2, Trash2, Mail, Phone, AlertCircle } from 'lucide-react';

export const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sales_executive',
    phone: '',
    is_active: true
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'sales_executive',
      phone: '',
      is_active: true
    });
    setModalError('');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      await api.post('/users', formData);
      setIsAddModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      setModalError(err.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleEditClick = (u) => {
    setSelectedUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      phone: u.phone || '',
      is_active: u.is_active
    });
    setModalError('');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    const payload = { ...formData };
    if (!payload.password) delete payload.password; // Only include password if set

    try {
      await api.put(`/users/${selectedUser.id}`, payload);
      setIsEditModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setModalError(err.response?.data?.detail || 'Failed to update user');
    }
  };

  const handleDelete = async (userToDelete) => {
    if (userToDelete.id === currentUser?.id) {
      alert("You cannot delete your own admin account while logged in!");
      return;
    }
    if (!window.confirm(`Delete user account for ${userToDelete.name}?`)) return;
    try {
      await api.delete(`/users/${userToDelete.id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  const roleLabels = {
    admin: 'System Administrator',
    sales_executive: 'Sales Executive',
    support_agent: 'Support Specialist'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" /> User Roster & Role Authorization
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin console for managing team members, assigning roles, and granting system access.
          </p>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Provision New User
          </button>
        )}
      </div>

      {/* User Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Fetching system user directory..." />
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No users found in directory.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">User Name & ID</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Role Assignment</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900">{u.name}</span>
                      <p className="text-[10px] font-mono text-slate-400">UID: #{u.id}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>
                    <td className="py-3 px-4">
                      <Badge value={u.role} label={roleLabels[u.role] || u.role} />
                    </td>
                    <td className="py-3 px-4 text-slate-600">{u.phone || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <Badge value={u.is_active ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {currentUser?.role === 'admin' && (
                        <button
                          onClick={() => handleEditClick(u)}
                          title="Edit User"
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {currentUser?.role === 'admin' && (
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={u.id === currentUser?.id}
                          title={u.id === currentUser?.id ? "Cannot delete self" : "Delete User"}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
      </div>

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
        title={isAddModalOpen ? 'Provision New System User' : 'Edit User Roster & Permissions'}
      >
        {modalError && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {modalError}
          </div>
        )}

        <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              <label className="block text-xs font-semibold text-slate-700">
                {isAddModalOpen ? 'Password *' : 'Password (leave empty to keep current)'}
              </label>
              <input
                type="password"
                required={isAddModalOpen}
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
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
              <label className="block text-xs font-semibold text-slate-700">Role Assignment</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="admin">Admin</option>
                <option value="sales_executive">Sales Executive</option>
                <option value="support_agent">Support Agent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Account Status</label>
              <select
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
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
              {isAddModalOpen ? 'Save User' : 'Update User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
