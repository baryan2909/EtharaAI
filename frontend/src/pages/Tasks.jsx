import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { Spinner } from '../components/common/Spinner';
import { formatDate, isDateOverdue } from '../utils/date';
import { 
  CheckSquare, Clock, AlertTriangle, Calendar, 
  Search, Filter, FolderKanban, ShieldAlert, BadgeInfo 
} from 'lucide-react';

export default function Tasks() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const fetchWorkspaceData = async () => {
    try {
      // 1. Fetch all projects first to construct the project filter dropdown
      const projRes = await API.get('/projects');
      setProjects(projRes.data.data);
      const projectIds = projRes.data.data.map(p => p._id);

      // 2. Fetch all tasks across all projects
      let allTasks = [];
      for (const pid of projectIds) {
        const taskRes = await API.get(`/tasks/project/${pid}`);
        const projTasks = taskRes.data?.data || [];
        allTasks = [...allTasks, ...projTasks];
      }
      
      // Sort tasks by due date or creation safely
      allTasks.sort((a, b) => {
        const timeA = a?.dueDate ? new Date(a.dueDate).getTime() : 0;
        const timeB = b?.dueDate ? new Date(b.dueDate).getTime() : 0;
        return (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB);
      });
      setTasks(allTasks);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  // Quick Status changer for Member/Admin on workspace page
  const handleUpdateStatus = async (taskId, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return;

    try {
      // Optimistic Update
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));

      await API.patch(`/tasks/${taskId}/status`, { status: newStatus });
      showToast(`Task status updated to ${newStatus}`, 'success');
      fetchWorkspaceData(); // refresh full list
    } catch (error) {
      showToast(error.message, 'error');
      fetchWorkspaceData(); // revert on fail
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="large" />
      </div>
    );
  }

  // Filter Tasks locally based on states
  const filteredTasks = tasks.filter((task) => {
    if (!task || !task.title) return false;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesProject = selectedProject === 'all' || task.projectId === selectedProject || task.projectId?._id === selectedProject;
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;

    return matchesSearch && matchesProject && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Breadcrumb */}
      <div>
        <h2 className="text-xl font-extrabold text-gray-800 dark:text-white">Workspace Tasks</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Inspect, filter, and progress all tasks assigned to you</p>
      </div>

      {/* Advanced Filters Panel */}
      <div className="bg-white dark:bg-darkbg-800 p-5 rounded-2xl border border-gray-150/40 dark:border-gray-800/80 shadow-premium dark:shadow-premium-dark flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex items-center w-full">
            <div className="absolute left-3.5 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search tasks by title or criteria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 focus:border-primary-500 bg-gray-50/50 dark:bg-darkbg-900/30 dark:border-gray-800 dark:focus:border-primary-500 outline-none text-gray-800 dark:text-gray-105 transition-all"
            />
          </div>
        </div>

        {/* Dropdowns Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-800/50 pt-4">
          
          {/* Project select */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">Project Category</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-gray-50/50 dark:bg-darkbg-900/30 dark:border-gray-800 outline-none text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Status select */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">Task Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-gray-50/50 dark:bg-darkbg-900/30 dark:border-gray-800 outline-none text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority select */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">Task Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-gray-50/50 dark:bg-darkbg-900/30 dark:border-gray-800 outline-none text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
          </div>

        </div>
      </div>

      {/* Task listing cards */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-darkbg-800 border border-dashed border-gray-250 dark:border-gray-800 rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-darkbg-700 text-gray-400 flex items-center justify-center">
            <BadgeInfo className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-white">No tasks matched criteria</h4>
            <p className="text-xs text-gray-400 max-w-xs mt-1">
              Adjust your filters or type a different query to discover active tasks.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => {
            const isAssignedToMe = task.assignedTo?._id === user?.id || task.assignedTo === user?.id;
            const isOverdue = isDateOverdue(task.dueDate, task.status);

            const prioColors = {
              High: 'bg-rose-50 text-rose-600 border border-rose-250/20 dark:bg-rose-950/10 dark:text-rose-400',
              Medium: 'bg-amber-50 text-amber-600 border border-amber-250/20 dark:bg-amber-950/10 dark:text-amber-400',
              Low: 'bg-gray-100 text-gray-500 border border-gray-250/20 dark:bg-darkbg-700 dark:text-gray-300'
            };

            const statusColors = {
              'Pending': 'bg-gray-100 text-gray-600 dark:bg-darkbg-700 dark:text-gray-300',
              'In Progress': 'bg-blue-50 text-blue-600 border border-blue-200/20 dark:bg-blue-950/15 dark:text-blue-400',
              'Completed': 'bg-emerald-50 text-emerald-600 border border-emerald-200/20 dark:bg-emerald-950/15 dark:text-emerald-400'
            };

            return (
              <div
                key={task._id}
                className={`relative bg-white dark:bg-darkbg-800 p-5 rounded-2xl border shadow-premium hover:shadow-md transition-all duration-300 flex flex-col justify-between ${
                  isAssignedToMe
                    ? 'border-primary-500/50 dark:border-primary-500/30 ring-1 ring-primary-500/10'
                    : 'border-gray-150/40 dark:border-gray-800/80'
                }`}
              >
                <div>
                  {/* Upper Meta details */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${prioColors[task.priority] || prioColors.Medium}`}>
                      {task.priority || 'Medium'}
                    </span>
                    
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusColors[task.status] || statusColors.Pending}`}>
                      {task.status || 'Pending'}
                    </span>
                  </div>

                  {/* Assigned to me Badge */}
                  {isAssignedToMe && (
                    <span className="absolute top-0 right-4 translate-y-[-50%] text-[8px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-primary-500 to-indigo-500 text-white px-2 py-0.5 rounded-md shadow-premium">
                      Assigned To Me
                    </span>
                  )}

                  {/* Title and Scope details */}
                  <h3 className="text-sm font-extrabold text-gray-800 dark:text-white mt-4 line-clamp-1">
                    {task.title}
                  </h3>
                  
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2 h-8">
                    {task.description || 'No detailed specifications added.'}
                  </p>

                  <div className="mt-4 border-t border-gray-50 dark:border-gray-850/50 pt-3 flex items-center justify-between text-[10px] text-gray-400 font-semibold">
                    {/* Due Date details */}
                    <div className={`flex items-center gap-1 ${isOverdue ? 'text-rose-500 animate-pulse' : ''}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>

                    {/* Inspect link */}
                    <Link
                      to={`/projects/${task.projectId?._id || task.projectId}`}
                      className="text-primary-500 hover:underline flex items-center gap-0.5 font-bold"
                    >
                      Kanban Board
                    </Link>
                  </div>
                </div>

                {/* Status Toggler - Member Permission status changer */}
                <div className="mt-5 pt-3.5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Update Status</span>
                  
                  <div className="flex gap-1 bg-gray-50 dark:bg-darkbg-900/40 border border-gray-150/20 p-0.5 rounded-lg">
                    {['Pending', 'In Progress', 'Completed'].map(s => (
                      <button
                        key={s}
                        onClick={() => handleUpdateStatus(task._id, task.status, s)}
                        className={`text-[9px] font-extrabold px-2 py-1 rounded-md transition-all cursor-pointer ${
                          task.status === s
                            ? 'bg-white dark:bg-darkbg-700 text-gray-800 dark:text-white shadow-premium'
                            : 'text-gray-450 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300'
                        }`}
                      >
                        {s === 'In Progress' ? 'Progress' : s}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
