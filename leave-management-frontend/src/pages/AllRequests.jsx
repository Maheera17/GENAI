import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { FileText, Check, X, RefreshCw, Filter } from 'lucide-react';

const getStatusStyle = (status) => {
  const s = status?.toLowerCase();
  if (s === 'accepted' || s === 'approved') return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
  if (s === 'rejected') return 'bg-red-100 text-red-700 border border-red-200';
  return 'bg-amber-100 text-amber-700 border border-amber-200';
};

const isPending = (status) => {
  const s = status?.toLowerCase();
  return s === 'pending' || !s;
};

const AllRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leave-requests');
      const data = Array.isArray(res.data) ? res.data : [];
      setRequests(data);
    } catch (err) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading((prev) => ({ ...prev, [id]: action }));
    try {
      const endpoint = action === 'approve'
        ? `/leave-requests/${id}/accept`
        : `/leave-requests/${id}/reject`;
      await api.put(endpoint);
      toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: action === 'approve' ? 'Accepted' : 'Rejected' }
            : r
        )
      );
    } catch (err) {
      toast.error(`Failed to ${action} request`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const filtered = requests.filter((req) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'pending' && isPending(req.status)) ||
      (filter === 'accepted' && (req.status?.toLowerCase() === 'accepted' || req.status?.toLowerCase() === 'approved')) ||
      (filter === 'rejected' && req.status?.toLowerCase() === 'rejected');

    const matchesSearch =
      !search ||
      String(req.employee_id).includes(search) ||
      req.leave_type?.toLowerCase().includes(search.toLowerCase()) ||
      req.reason?.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const pendingCount = requests.filter((r) => isPending(r.status)).length;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">All Leave Requests</h1>
            <p className="text-slate-500 text-sm">
              {requests.length} total · {pendingCount} pending review
            </p>
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        <Filter className="w-4 h-4 text-slate-400 ml-1" />
        {['all', 'pending', 'accepted', 'rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all capitalize
              ${filter === f
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            {f}
          </button>
        ))}
        <div className="ml-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by employee, type..."
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-56"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading all requests...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['ID', 'Emp ID', 'Leave Type', 'From', 'To', 'Days', 'Reason', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((req, i) => (
                  <tr key={req.id || i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-4 text-sm font-mono text-slate-400">#{req.id}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-700">{req.employee_id}</td>
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium whitespace-nowrap">
                        {req.leave_type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">{req.from_date}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">{req.to_date}</td>
                    <td className="px-4 py-4 text-sm text-center text-slate-600">
                      <span className="font-semibold">{req.days ?? '—'}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500 max-w-[180px]">
                      <p className="truncate" title={req.reason}>{req.reason || '—'}</p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(req.status)}`}>
                        {req.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(req.id, 'approve')}
                          disabled={!isPending(req.status) || actionLoading[req.id]}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-semibold rounded-lg transition-all shadow-sm shadow-emerald-200 disabled:shadow-none"
                        >
                          {actionLoading[req.id] === 'approve' ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'reject')}
                          disabled={!isPending(req.status) || actionLoading[req.id]}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-semibold rounded-lg transition-all shadow-sm shadow-red-200 disabled:shadow-none"
                        >
                          {actionLoading[req.id] === 'reject' ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          Reject
                        </button>
                      </div>
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

export default AllRequests;
