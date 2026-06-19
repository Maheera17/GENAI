import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Search, RefreshCw, TrendingDown } from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees');
      const data = Array.isArray(res.data) ? res.data : [];
      setEmployees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filtered = employees.filter((emp) => {
    const q = search.toLowerCase();
    return (
      !search ||
      emp.name?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.department?.toLowerCase().includes(q) ||
      emp.role?.toLowerCase().includes(q) ||
      String(emp.id).includes(q)
    );
  });

  const getRoleBadge = (role) => {
    if (role === 'Manager') return 'bg-amber-100 text-amber-700 border border-amber-200';
    return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
  };

  const getBalanceColor = (balance) => {
    if (balance > 15) return 'text-emerald-600';
    if (balance > 7) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Employees</h1>
            <p className="text-slate-500 text-sm">{employees.length} team members</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees..."
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 w-56 shadow-sm"
            />
          </div>
          <button
            onClick={fetchEmployees}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: employees.length, color: 'text-slate-700' },
          { label: 'Managers', value: employees.filter(e => e.role === 'Manager').length, color: 'text-amber-600' },
          { label: 'Employees', value: employees.filter(e => e.role !== 'Manager').length, color: 'text-indigo-600' },
          { label: 'Departments', value: new Set(employees.map(e => e.department)).size, color: 'text-emerald-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <p className="text-slate-500 text-xs font-medium">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading employees...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No employees found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['ID', 'Name', 'Email', 'Department', 'Role', 'Leave Balance'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((emp, i) => (
                  <tr key={emp.id || i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 text-sm font-mono text-slate-400">#{emp.id}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-white font-bold text-xs">
                            {(emp.name || emp.email || '?').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{emp.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">{emp.email || '—'}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                        {emp.department || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleBadge(emp.role)}`}>
                        {emp.role || 'Employee'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <TrendingDown className={`w-3.5 h-3.5 ${getBalanceColor(emp.leave_balance)}`} />
                        <span className={`text-sm font-bold ${getBalanceColor(emp.leave_balance)}`}>
                          {emp.leave_balance ?? '—'} days
                        </span>
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

export default Employees;
