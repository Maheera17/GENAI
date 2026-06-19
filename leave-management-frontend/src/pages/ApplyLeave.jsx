import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { CalendarPlus, Send } from 'lucide-react';

const LEAVE_TYPES = ['Sick', 'Casual', 'Annual'];

const ApplyLeave = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    leave_type: '',
    from_date: '',
    to_date: '',
    reason: '',
    employee_id: user?.id || '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calcDays = () => {
    if (!form.from_date || !form.to_date) return null;
    const from = new Date(form.from_date);
    const to = new Date(form.to_date);
    const diff = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(form.to_date) < new Date(form.from_date)) {
      toast.error('End date cannot be before start date');
      return;
    }
    setLoading(true);
    try {
      await api.post('/leave-requests', form);
      toast.success('Leave request submitted successfully!');
      navigate('/leave/my-requests');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to submit leave request';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const days = calcDays();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <CalendarPlus className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Apply for Leave</h1>
            <p className="text-slate-500 text-sm">Fill in the details below to submit your leave request</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Leave Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <select
              name="leave_type"
              required
              value={form.leave_type}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="">Select leave type...</option>
              {LEAVE_TYPES.map((type) => (
                <option key={type} value={type}>{type} Leave</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                From Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="from_date"
                required
                value={form.from_date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                To Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="to_date"
                required
                value={form.to_date}
                onChange={handleChange}
                min={form.from_date || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          {/* Days Preview */}
          {days && (
            <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl">
              <CalendarPlus className="w-4 h-4 text-indigo-500" />
              <p className="text-indigo-700 text-sm font-medium">
                Duration: <span className="font-bold">{days} day{days > 1 ? 's' : ''}</span>
              </p>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              required
              rows={4}
              value={form.reason}
              onChange={handleChange}
              placeholder="Please provide a brief reason for your leave..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm resize-none"
            />
          </div>

          {/* Employee ID (read-only) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Employee ID
            </label>
            <input
              type="text"
              value={form.employee_id}
              readOnly
              className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm cursor-not-allowed"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;
