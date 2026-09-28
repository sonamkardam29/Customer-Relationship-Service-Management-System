import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  ArrowLeft,
  LifeBuoy,
  MessageSquare,
  Send,
  UserCheck,
  CheckCircle,
  Clock,
  Building,
  FileText,
  AlertCircle
} from 'lucide-react';

export const TicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updatingTicket, setUpdatingTicket] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  const fetchTicket = async () => {
    try {
      const response = await api.get(`/tickets/${id}`);
      setTicket(response.data);
      setResolutionNotes(response.data.resolution_notes || '');
    } catch (err) {
      console.error(err);
      setError('Service ticket not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await api.post(`/tickets/${id}/comments`, { comment: commentText.trim() });
      setCommentText('');
      fetchTicket();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusPriorityUpdate = async (field, value) => {
    setUpdatingTicket(true);
    setUpdateMsg('');
    try {
      await api.put(`/tickets/${id}`, { [field]: value });
      setUpdateMsg(`Ticket ${field} updated successfully.`);
      fetchTicket();
    } catch (err) {
      alert(err.response?.data?.detail || `Failed to update ticket ${field}`);
    } finally {
      setUpdatingTicket(false);
    }
  };

  const handleSaveResolutionNotes = async () => {
    setUpdatingTicket(true);
    try {
      await api.put(`/tickets/${id}`, { resolution_notes: resolutionNotes });
      setUpdateMsg('Resolution notes saved.');
      fetchTicket();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update resolution notes');
    } finally {
      setUpdatingTicket(false);
    }
  };

  if (loading) return <LoadingSpinner label="Fetching service case details..." />;
  if (error || !ticket) return <div className="p-4 bg-rose-50 text-rose-700 rounded-xl">{error}</div>;

  const canManage = ['admin', 'support_agent'].includes(user?.role);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/tickets" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Service Tickets List
      </Link>

      {updateMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg flex items-center gap-2 border border-emerald-200">
          <CheckCircle className="w-4 h-4" /> {updateMsg}
        </div>
      )}

      {/* Ticket Overview Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Ticket #{ticket.id}</span>
              <span>•</span>
              <span>Category: {ticket.category}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">{ticket.subject}</h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <Building className="w-3.5 h-3.5" /> Customer: <strong className="text-slate-800">{ticket.customer_name}</strong> ({ticket.customer_company || 'Individual'})
            </p>
          </div>

          {/* Inline Status & Priority Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <span className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">Status</span>
              {canManage ? (
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusPriorityUpdate('status', e.target.value)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending Customer">Pending Customer</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              ) : (
                <Badge value={ticket.status} />
              )}
            </div>

            <div>
              <span className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">Priority</span>
              {canManage ? (
                <select
                  value={ticket.priority}
                  onChange={(e) => handleStatusPriorityUpdate('priority', e.target.value)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              ) : (
                <Badge value={ticket.priority} />
              )}
            </div>
          </div>
        </div>

        {/* Problem Description */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Problem Description
          </h3>
          <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
            {ticket.description}
          </p>
        </div>

        {/* Assigned Agent & Timestamps */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span>Assigned Agent: <strong className="text-slate-800">{ticket.assigned_agent?.name || 'Unassigned'}</strong></span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Opened: {new Date(ticket.created_at).toLocaleString()}</span>
            <span>Last Updated: {new Date(ticket.updated_at).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Resolution Notes Box */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600" /> Resolution Notes & Root Cause Analysis
        </h3>
        {canManage ? (
          <div className="space-y-2">
            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Record technical fix, root cause, software version patch deployed, or resolution instructions..."
              className="w-full p-3 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveResolutionNotes}
                disabled={updatingTicket}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                Save Resolution Notes
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
            {ticket.resolution_notes || 'No resolution notes recorded yet.'}
          </p>
        )}
      </div>

      {/* Comments & Activity Timeline */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-600" /> Case Communication & Comments Log ({ticket.comments?.length || 0})
        </h3>

        {/* Comment List */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {ticket.comments?.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-4 text-center">No comments logged on this ticket yet.</p>
          ) : (
            ticket.comments.map((c) => (
              <div key={c.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{c.user?.name || 'Support Staff'}</span>
                    <Badge value={c.user?.role} />
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-800 text-xs leading-relaxed pt-1 whitespace-pre-wrap">{c.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* Reply Form */}
        <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-3 border-t border-slate-100">
          <input
            type="text"
            required
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Type comment or status update note..."
            className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={submittingComment}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> Post Comment
          </button>
        </form>
      </div>
    </div>
  );
};
