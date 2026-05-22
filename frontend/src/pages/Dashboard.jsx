import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { Spinner } from '../components/common/Spinner';
import { formatDate } from '../utils/date';
import {
  CheckSquare, Clock, ListTodo, AlertCircle, Users,
  FolderOpen, ChevronRight, TrendingUp, ArrowUpRight
} from 'lucide-react';

// Stat card
function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    blue:   { bg: 'bg-primary-50 dark:bg-primary-900/20',   icon: 'text-primary-500' },
    amber:  { bg: 'bg-amber-50 dark:bg-amber-900/20',        icon: 'text-amber-500'   },
    green:  { bg: 'bg-success-50 dark:bg-success-950/30',    icon: 'text-success-500' },
    red:    { bg: 'bg-danger-50 dark:bg-danger-950/30',      icon: 'text-danger-500'  },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div>
        <p className="text-xs text-warm-500 dark:text-warm-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-warm-900 dark:text-warm-100 mt-0.5 leading-none">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard/stats')
      .then(res => setStats(res.data.data))
      .catch(err => {
        showToast(err.message, 'error');
        setStats({
          totalTasks: 0,
          tasksByStatus: { pending: 0, inProgress: 0, completed: 0 },
          overdueCount: 0,
          overdueTasks: [],
          tasksPerUser: [],
          recentTasks: [],
          projectSummaries: []
        });
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="large" />
      </div>
    );
  }

  const totalTasks    = stats.totalTasks || 0;
  const completedPct  = totalTasks > 0 ? Math.round(((stats.tasksByStatus?.completed || 0) / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-up">

      {/* ── Greeting ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-warm-900 dark:text-warm-100">
            Good {getTimeGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
            Here's what's happening across your projects.
          </p>
        </div>

        {/* Overall progress pill */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-darkbg-800 
          border border-warm-200/60 dark:border-darkbg-700 rounded-xl shadow-sm w-fit">
          <div className="relative w-9 h-9">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor"
                className="text-warm-100 dark:text-darkbg-700" strokeWidth="3" />
              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor"
                className="text-primary-500" strokeWidth="3"
                strokeDasharray={2 * Math.PI * 15}
                strokeDashoffset={2 * Math.PI * 15 * (1 - completedPct / 100)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-warm-700 dark:text-warm-300">
              {completedPct}%
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-warm-700 dark:text-warm-300">
              {stats.tasksByStatus?.completed || 0} / {totalTasks} tasks done
            </p>
            <p className="text-[10px] text-warm-400">overall completion</p>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Projects"       value={stats.projectSummaries?.length || 0}   icon={FolderOpen}   color="blue"  />
        <StatCard label="Pending tasks"  value={stats.tasksByStatus?.pending || 0}      icon={ListTodo}     color="amber" />
        <StatCard label="Completed"      value={stats.tasksByStatus?.completed || 0}    icon={CheckSquare}  color="green" />
        <StatCard label="Overdue"        value={stats.overdueCount || 0}               icon={AlertCircle}  color="red"   />
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Projects list */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-warm-800 dark:text-warm-200">Active Projects</h3>
              <Link to="/projects" className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-0.5">
                See all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {(stats.projectSummaries?.length || 0) === 0 ? (
              <div className="text-center py-10 text-sm text-warm-400">
                No projects yet. Create your first one!
              </div>
            ) : (
              <div className="space-y-3">
                {stats.projectSummaries?.slice(0, 4).map((proj) => (
                  <Link
                    key={proj.id}
                    to={`/projects/${proj.id}`}
                    className="block group p-4 rounded-xl border border-warm-100 dark:border-darkbg-700
                      hover:border-primary-200 dark:hover:border-primary-900/40
                      hover:bg-warm-50 dark:hover:bg-darkbg-700/50 transition-all duration-150"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-warm-800 dark:text-warm-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {proj.name}
                        </h4>
                        <p className="text-xs text-warm-400 mt-0.5">
                          {proj.memberCount} member{proj.memberCount !== 1 ? 's' : ''} · {proj.taskCount} task{proj.taskCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-warm-500 dark:text-warm-400 flex-shrink-0">
                        {proj.progress}%
                        <ArrowUpRight className="w-3 h-3 text-warm-300 group-hover:text-primary-500 transition-colors" />
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="progress-bar h-1.5">
                      <div className="progress-fill" style={{ width: `${proj.progress}%` }} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Overdue alert */}
          {stats.overdueTasks?.length > 0 && (
            <div className="card border-danger-200/50 dark:border-danger-950/30 p-5 space-y-3">
              <div className="flex items-center gap-2 text-danger-600 dark:text-danger-400">
                <AlertCircle className="w-4 h-4" />
                <h4 className="text-sm font-semibold">
                  {stats.overdueCount} Overdue task{stats.overdueCount !== 1 ? 's' : ''}
                </h4>
              </div>
              <ul className="space-y-2">
                {stats.overdueTasks?.slice(0, 3).map(task => (
                  <li key={task._id}
                    className="flex items-center justify-between p-3 rounded-lg
                      bg-danger-50/40 dark:bg-danger-950/10 border border-danger-100 dark:border-danger-950/20">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-warm-800 dark:text-warm-200 truncate">{task.title}</p>
                      <p className="text-[10px] text-warm-400 mt-0.5">
                        Due {formatDate(task.dueDate)}
                      </p>
                    </div>
                    <Link
                      to={`/projects/${task.projectId?._id}`}
                      className="flex-shrink-0 text-[10px] font-semibold text-danger-600 dark:text-danger-400 hover:underline ml-3"
                    >
                      View →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Team workload */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-warm-800 dark:text-warm-200 mb-4">Team Workload</h3>
            {(stats.tasksPerUser?.length || 0) === 0 ? (
              <p className="text-xs text-warm-400 text-center py-4">No assignments yet</p>
            ) : (
              <ul className="space-y-3.5">
                {stats.tasksPerUser?.slice(0, 5).map((u, i) => {
                  const pct = Math.round((u.count / (totalTasks || 1)) * 100);
                  return (
                    <li key={i}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-warm-700 dark:text-warm-300 truncate max-w-[130px]">{u.name}</span>
                        <span className="text-warm-400 flex-shrink-0">{u.count} task{u.count !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="progress-bar h-1.5">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Recent activity */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-warm-800 dark:text-warm-200 mb-4">Recent Activity</h3>
            {(stats.recentTasks?.length || 0) === 0 ? (
              <p className="text-xs text-warm-400 text-center py-4">No recent activity</p>
            ) : (
              <ul className="space-y-3">
                {stats.recentTasks?.slice(0, 5).map(task => (
                  <li key={task._id} className="flex items-start gap-2.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-warm-700 dark:text-warm-300 truncate">{task.title}</p>
                      <p className="text-warm-400 mt-0.5">
                        {task.status} · {formatDate(task.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ── Admin analytics ── */}
      {user?.role === 'Admin' && (
        <div className="card p-6 border-primary-100 dark:border-primary-900/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-warm-800 dark:text-warm-200">Analytics</h3>
                <p className="text-[10px] text-primary-500 font-medium">Admin view</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Completion donut */}
            <div className="bg-warm-50 dark:bg-darkbg-700/40 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-semibold text-warm-600 dark:text-warm-400 uppercase tracking-wider">
                Task Distribution
              </h4>
              <div className="flex items-center gap-5">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" className="text-warm-200 dark:text-darkbg-600" stroke="currentColor" strokeWidth="6" />
                    <circle cx="24" cy="24" r="20" fill="none" className="text-success-500" stroke="currentColor" strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 20}
                      strokeDashoffset={2 * Math.PI * 20 * (1 - (stats.tasksByStatus?.completed || 0) / (totalTasks || 1))}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-bold text-warm-800 dark:text-warm-200">{completedPct}%</span>
                    <span className="text-[8px] text-warm-400 uppercase tracking-wider">done</span>
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  {[
                    { label: 'Completed', value: stats.tasksByStatus?.completed || 0, color: 'bg-success-500' },
                    { label: 'In Progress', value: stats.tasksByStatus?.inProgress || 0, color: 'bg-primary-500' },
                    { label: 'Pending', value: stats.tasksByStatus?.pending || 0, color: 'bg-amber-400' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2 text-xs">
                      <span className={`w-2 h-2 rounded-sm flex-shrink-0 ${item.color}`} />
                      <span className="text-warm-500 dark:text-warm-400 flex-1">{item.label}</span>
                      <span className="font-semibold text-warm-700 dark:text-warm-300">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resource allocation */}
            <div className="bg-warm-50 dark:bg-darkbg-700/40 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-semibold text-warm-600 dark:text-warm-400 uppercase tracking-wider">
                Resource Allocation
              </h4>
              {(stats.tasksPerUser?.length || 0) === 0 ? (
                <p className="text-xs text-warm-400 py-4">No assignments</p>
              ) : (
                <div className="space-y-3">
                  {stats.tasksPerUser?.slice(0, 4).map((u, i) => {
                    const pct = Math.round((u.count / (totalTasks || 1)) * 100);
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-warm-700 dark:text-warm-300 truncate max-w-[140px]">{u.name}</span>
                          <span className="text-warm-400 flex-shrink-0">{pct}%</span>
                        </div>
                        <div className="progress-bar h-1.5">
                          <div className="progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Portfolio table */}
          <div className="mt-5 pt-5 border-t border-warm-100 dark:border-darkbg-700">
            <h4 className="text-xs font-semibold text-warm-600 dark:text-warm-400 uppercase tracking-wider mb-3">
              Project Portfolio
            </h4>
            <div className="overflow-x-auto rounded-xl border border-warm-100 dark:border-darkbg-700">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-warm-100 dark:border-darkbg-700 bg-warm-50 dark:bg-darkbg-700/50">
                    <th className="py-2.5 px-4 font-semibold text-warm-500 dark:text-warm-400">Project</th>
                    <th className="py-2.5 px-4 font-semibold text-warm-500 dark:text-warm-400">Team</th>
                    <th className="py-2.5 px-4 font-semibold text-warm-500 dark:text-warm-400">Tasks</th>
                    <th className="py-2.5 px-4 font-semibold text-warm-500 dark:text-warm-400">Progress</th>
                    <th className="py-2.5 px-4 font-semibold text-warm-500 dark:text-warm-400 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-50 dark:divide-darkbg-700">
                  {stats.projectSummaries?.map(p => (
                    <tr key={p.id} className="hover:bg-warm-50 dark:hover:bg-darkbg-700/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-warm-800 dark:text-warm-200">
                        <Link to={`/projects/${p.id}`} className="hover:text-primary-500 transition-colors">
                          {p.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-warm-500">{p.memberCount} members</td>
                      <td className="py-3 px-4 text-warm-500">{p.completedCount}/{p.taskCount}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="progress-bar h-1.5 w-16">
                            <div className="progress-fill" style={{ width: `${p.progress}%` }} />
                          </div>
                          <span className="text-warm-500 font-medium">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`badge ${
                          p.status === 'Active' || !p.status
                            ? 'bg-success-50 text-success-600 dark:bg-success-950/20 dark:text-success-400'
                            : 'bg-warm-100 text-warm-500 dark:bg-darkbg-700 dark:text-warm-400'
                        }`}>
                          {p.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
