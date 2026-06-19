import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  CalendarPlus,
  ClipboardList,
  MessageSquareText,
  Users,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className={`${bg} rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4`}>
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <p className="text-slate-800 text-2xl font-bold mt-0.5">{value ?? '—'}</p>
    </div>
  </div>
);

const QuickCard = ({ to, icon: Icon, label, desc, gradient }) => (
  <Link
    to={to}
    className={`${gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3 group`}
  >
    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="font-semibold text-base">{label}</p>
      <p className="text-white/70 text-xs mt-0.5">{desc}</p>
    </div>
  </Link>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [employeeData, setEmployeeData] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, balRes, reqRes] = await Promise.allSettled([
          api.get(`/employees/${user?.id}`),
          api.get(`/employees/${user?.id}/leave-balance`),
          api.get(`/leave-requests?employee_id=${user?.id}`),
        ]);

        if (empRes.status === 'fulfilled') setEmployeeData(empRes.value.data);
        if (balRes.status === 'fulfilled') setLeaveBalance(balRes.value.data);
        if (reqRes.status === 'fulfilled') {
          const reqs = Array.isArray(reqRes.value.data) ? reqRes.value.data : [];
          setRecentRequests(reqs.slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchData();
    else setLoading(false);
  }, [user]);

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === 'accepted' || s === 'approved') return 'bg-emerald-100 text-emerald-700';
    if (s === 'rejected') return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-700';
  };

  const name = employeeData?.name || user?.sub?.split('@')[0] || 'User';
  const balance = leaveBalance?.balance ?? leaveBalance?.remaining_balance ?? leaveBalance;

  const pendingCount = recentRequests.filter((r) => r.status?.toLowerCase() === 'pending').length;
  const approvedCount = recentRequests.filter(
    (r) => r.status?.toLowerCase() === 'accepted' || r.status?.toLowerCase() === 'approved'
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full opacity-10">
          <div className="w-48 h-48 bg-white rounded-full absolute -top-10 -right-10" />
          <div className="w-32 h-32 bg-white rounded-full absolute bottom-0 right-20" />
        </div>
        <div className="relative z-10">
          <p className="text-indigo-200 text-sm font-medium">Hello there 👋</p>
          <h1 className="text-2xl font-bold mt-1 capitalize">{name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold
              ${user?.role === 'Manager' ? 'bg-amber-400/30 text-amber-200 border border-amber-400/40'
                : 'bg-white/20 text-white/90 border border-white/30'}`}>
              {user?.role || 'Employee'}
            </span>
            {employeeData?.department && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/20">
                {employeeData.department}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Leave Balance"
          value={typeof balance === 'object' ? JSON.stringify(balance) : balance}
          icon={TrendingUp}
          color="bg-indigo-500"
          bg="bg-white"
        />
        <StatCard
          label="Pending Requests"
          value={pendingCount}
          icon={Clock}
          color="bg-amber-500"
          bg="bg-white"
        />
        <StatCard
          label="Approved"
          value={approvedCount}
          icon={CheckCircle}
          color="bg-emerald-500"
          bg="bg-white"
        />
        <StatCard
          label="Total Requests"
          value={recentRequests.length}
          icon={FileText}
          color="bg-purple-500"
          bg="bg-white"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-slate-700 font-semibold text-sm uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickCard
            to="/leave/apply"
            icon={CalendarPlus}
            label="Apply Leave"
            desc="Submit a new leave request"
            gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
          />
          <QuickCard
            to="/leave/my-requests"
            icon={ClipboardList}
            label="My Requests"
            desc="View your leave history"
            gradient="bg-gradient-to-br from-purple-500 to-purple-700"
          />
          <QuickCard
            to="/ai-chat"
            icon={MessageSquareText}
            label="AI Assistant"
            desc="Ask anything about leaves"
            gradient="bg-gradient-to-br from-sky-500 to-sky-700"
          />
          {user?.role === 'Manager' && (
            <QuickCard
              to="/leave/all-requests"
              icon={FileText}
              label="All Requests"
              desc="Manage team leave requests"
              gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
            />
          )}
          {user?.role === 'Manager' && (
            <QuickCard
              to="/employees"
              icon={Users}
              label="Employees"
              desc="View all team members"
              gradient="bg-gradient-to-br from-orange-500 to-orange-700"
            />
          )}
        </div>
      </div>

      {/* Recent Requests */}
      {recentRequests.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-slate-700 font-semibold">Recent Leave Requests</h2>
            <Link to="/leave/my-requests" className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  {['Type', 'From', 'To', 'Days', 'Status'].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentRequests.map((req, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-medium text-slate-700">{req.leave_type}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-500">{req.from_date}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-500">{req.to_date}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-500">{req.days ?? '—'}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
