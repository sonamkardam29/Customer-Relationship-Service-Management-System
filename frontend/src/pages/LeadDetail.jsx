import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  ArrowLeft,
  Target,
  Mail,
  Phone,
  Building,
  Calendar,
  CheckCircle,
  TrendingUp,
  UserCheck,
  Check
} from 'lucide-react';

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Converted'];

export const LeadDetail = () => {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLead = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/leads/${id}`);
      setLead(response.data);
    } catch (err) {
      console.error(err);
      setError('Lead not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [id]);

  const handleStageChange = async (newStatus) => {
    try {
      await api.put(`/leads/${id}`, { lead_status: newStatus });
      fetchLead();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update lead status');
    }
  };

  if (loading) return <LoadingSpinner label="Loading lead opportunity details..." />;
  if (error || !lead) return <div className="p-4 bg-rose-50 text-rose-700 rounded-xl">{error}</div>;

  const currentStageIndex = STAGES.indexOf(lead.lead_status);

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link to="/leads" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Leads Pipeline
      </Link>

      {/* Lead Summary Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{lead.name}</h1>
              <Badge value={lead.lead_status} />
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <Building className="w-3.5 h-3.5" /> {lead.company || 'Private Account'} • Source: {lead.source}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-teal-50 px-4 py-2.5 rounded-xl border border-teal-100">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            <div>
              <span className="block text-[10px] text-teal-600 uppercase font-semibold">Lead Score</span>
              <span className="text-lg font-bold text-teal-700">{lead.lead_score} / 100</span>
            </div>
          </div>
        </div>

        {/* Pipeline Step Progress Workflow */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Sales Pipeline Progression Stage
          </h3>
          <div className="flex items-center justify-between relative max-w-2xl mx-auto py-2">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0" />
            {STAGES.map((stage, idx) => {
              const isCompleted = currentStageIndex >= idx;
              const isCurrent = lead.lead_status === stage;

              return (
                <button
                  key={stage}
                  onClick={() => handleStageChange(stage)}
                  disabled={lead.lead_status === 'Converted'}
                  className="relative z-10 flex flex-col items-center group focus:outline-none"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCurrent
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md scale-110'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border-2 border-slate-300 text-slate-400 group-hover:border-indigo-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`mt-2 text-xs font-semibold transition-colors ${
                      isCurrent ? 'text-indigo-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {stage}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lead Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="space-y-2">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase">Contact Information</span>
            <p className="flex items-center gap-2 text-slate-700"><Mail className="w-3.5 h-3.5 text-slate-400" /> {lead.email}</p>
            <p className="flex items-center gap-2 text-slate-700"><Phone className="w-3.5 h-3.5 text-slate-400" /> {lead.phone || 'N/A'}</p>
          </div>

          <div className="space-y-2">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase">Target & Industry</span>
            <p className="text-slate-700"><span className="font-semibold">Industry:</span> {lead.industry || 'Financial Services'}</p>
            <p className="text-slate-700"><span className="font-semibold">Expected Date:</span> {lead.expected_conversion_date || 'N/A'}</p>
          </div>

          <div className="space-y-2">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase">Assignment</span>
            <p className="flex items-center gap-2 text-slate-700"><UserCheck className="w-3.5 h-3.5 text-slate-400" /> {lead.assigned_sales?.name || 'Unassigned'}</p>
            <p className="text-slate-500 text-[11px]">Created on {new Date(lead.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
