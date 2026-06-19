import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, RefreshCw } from 'lucide-react';

const getStatusStyle = (status) => {
  const s = status?.toLowerCase();
  if (s === 'accepted' || s === 'approved') return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
  if (s === 'rejected') return 'bg-red-100 text-red-700 border border-red-200';
  return 'bg-amber-100 text-amber-700 border border-amber-200';
};

const MyRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/leave-requests?employee_id=${user?.id}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setRequests(data);
    } catch (err) {
      setError('Failed to load leave requests.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchRequests();
  }, [user]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">My Leave Requests</h1>
            <p className="text-slate-500 text-sm">{requests.length} total request{requests.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Status summary pills */}
      <div className="flex gap-3 flex-wrap">
        {['Pending', 'Accepted', 'Rejected'].map((status) => {
          const count = requests.filter((r) =>
            r.status?.toLowerCase() === status.toLowerCase() ||
            (status === 'Accepted' && r.status?.toLowerCase() === 'approved')
          ).length;
          return (
            <div key={status} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 ${getStatusStyle(status)}`}>
              <span className="font-semibold">{count}</span>
              <span>{status}</span>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading requests...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-red-500 font-medium">{error}</p>
            <button onClick={fetchRequests} className="text-indigo-600 text-sm underline">Try again</button>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
              <ClipboardList className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No leave requests found</p>
            <p className="text-slate-400 text-sm">You haven't submitted any leave requests yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Leave Type', 'From', 'To', 'Days', 'Reason', 'Status', 'Manager Comments'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {requests.map((req, i) => (
                  <tr key={req.id || i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">
                        {req.leave_type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">{req.from_date}</td>
                    <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">{req.to_date}</td>
                    <td className="px-5 py-4 text-sm text-slate-600 text-center whitespace-nowrap">
                      <span className="font-semibold">{req.days ?? '—'}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 max-w-[200px]">
                      <p className="truncate" title={req.reason}>{req.reason || '—'}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(req.status)}`}>
                        {req.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 max-w-[200px]">
                      <p className="truncate" title={req.manager_comments}>
                        {req.manager_comments || <span className="text-slate-300 italic">No comments</span>}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;
