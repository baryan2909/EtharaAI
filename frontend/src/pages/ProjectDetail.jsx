import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import API from '../services/api';
import { Spinner } from '../components/common/Spinner';
import { formatDate, formatInputDate, isDateOverdue } from '../utils/date';
import { 
  Users, UserPlus, UserMinus, Plus, Trash2, Calendar, 
  AlertTriangle, X, CheckSquare, Edit3, ArrowRight, Shield 
} from 'lucide-react';

export default function ProjectDetail() {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { socket, joinProjectRoom, leaveProjectRoom } = useSocket();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals Toggles
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Forms States
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const fetchProjectDetails = useCallback(async () => {
    try {
      // 1. Fetch Project Details
      const projRes = await API.get(`/projects/${projectId}`);
      setProject(projRes.data.data);

      // 2. Fetch Project Tasks
      const tasksRes = await API.get(`/tasks/project/${projectId}`);
      setTasks(Array.isArray(tasksRes.data?.data) ? tasksRes.data.data : []);
    } catch (error) {
      showToast(error.message, 'error');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [projectId, navigate, showToast]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  // Handle Socket.io room joins & real-time listeners
  useEffect(() => {
    if (projectId) {
      joinProjectRoom(projectId);
      return () => {
        leaveProjectRoom(projectId);
      };
    }
  }, [projectId, joinProjectRoom, leaveProjectRoom]);

  useEffect(() => {
    if (!socket) return;

    const handleTaskCreated = (newTask) => {
      setTasks((prevTasks) => {
        if (prevTasks.some((t) => t._id === newTask._id)) return prevTasks;
        return [...prevTasks, newTask];
      });
    };

    const handleTaskUpdated = (updatedTask) => {
      setTasks((prevTasks) => {
        return prevTasks.map((t) => (t._id === updatedTask._id ? updatedTask : t));
      });
    };

    const handleTaskDeleted = ({ taskId }) => {
      setTasks((prevTasks) => {
        return prevTasks.filter((t) => t._id !== taskId);
      });
    };

    const handleTaskStatusChanged = (updatedTask) => {
      setTasks((prevTasks) => {
        if (!updatedTask || !updatedTask._id) return prevTasks;
        return prevTasks.map((t) => (t._id === updatedTask._id ? updatedTask : t));
      });
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('task:status_changed', handleTaskStatusChanged);

    return () => {
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('task:status_changed', handleTaskStatusChanged);
    };
  }, [socket]);

  // Invite Member handler
  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);
    try {
      const res = await API.post(`/projects/${projectId}/members`, { email: inviteEmail });
      setProject(res.data.data);
      showToast(`Member invited successfully!`, 'success');
      setInviteEmail('');
      setMemberModalOpen(false);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setInviteLoading(false);
    }
  };

  // Remove Member handler
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the project? Their assigned tasks will be unassigned.')) {
      return;
    }

    try {
      const res = await API.delete(`/projects/${projectId}/members/${memberId}`);
      setProject(res.data.data);
      showToast('Member removed successfully', 'success');
      fetchProjectDetails(); // reload tasks to reflect unassignment
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  // Create Task handler
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setFormLoading(true);
    try {
      const payload = {
        title: taskTitle,
        description: taskDesc,
        dueDate: taskDueDate || undefined,
        priority: taskPriority,
        assignedTo: taskAssignee || undefined,
        projectId
      };

      if (editingTask) {
        await API.put(`/tasks/${editingTask._id}`, payload);
        showToast('Task updated successfully!', 'success');
      } else {
        await API.post('/tasks', payload);
        showToast('Task created successfully!', 'success');
      }

      resetTaskForm();
      fetchProjectDetails();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Task handler
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await API.delete(`/tasks/${taskId}`);
      showToast('Task deleted successfully', 'success');
      fetchProjectDetails();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  // Open Edit Task Form
  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskDueDate(formatInputDate(task.dueDate));
    setTaskPriority(task.priority);
    setTaskAssignee(task.assignedTo?._id || (typeof task.assignedTo === 'string' ? task.assignedTo : ''));
    setTaskModalOpen(true);
  };

  const resetTaskForm = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDesc('');
    setTaskDueDate('');
    setTaskPriority('Medium');
    setTaskAssignee('');
    setTaskModalOpen(false);
  };

  // HTML5 Drag & Drop Handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = draggedTaskId || e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Optimistically update status on frontend
    const updatedTasks = tasks.map((t) => {
      if (t._id === taskId) {
        return { ...t, status: targetStatus };
      }
      return t;
    });
    setTasks(updatedTasks);

    try {
      await API.patch(`/tasks/${taskId}/status`, { status: targetStatus });
      showToast(`Task moved to ${targetStatus}`, 'success');
      fetchProjectDetails(); // refresh completely to populate correctly
    } catch (error) {
      showToast(error.message, 'error');
      fetchProjectDetails(); // revert to correct db state
    } finally {
      setDraggedTaskId(null);
    }
  };

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="large" />
      </div>
    );
  }

  // Filter Tasks by Columns safely
  const pendingTasks = (tasks || []).filter(t => t && t.status === 'Pending');
  const inProgressTasks = (tasks || []).filter(t => t && t.status === 'In Progress');
  const completedTasks = (tasks || []).filter(t => t && t.status === 'Completed');

  const isProjectAdmin = project.createdBy?._id === user?.id || project.createdBy === user?.id;

  const renderTaskCard = (task) => {
    if (!task) return null;
    const isOverdue = isDateOverdue(task.dueDate, task.status);
    const prioColors = {
      High: 'bg-rose-50 text-rose-600 border border-rose-250/20 dark:bg-rose-950/10 dark:text-rose-400',
      Medium: 'bg-amber-50 text-amber-600 border border-amber-250/20 dark:bg-amber-950/10 dark:text-amber-400',
      Low: 'bg-gray-100 text-gray-500 border border-gray-250/20 dark:bg-darkbg-700 dark:text-gray-300'
    };
    const priorityClass = prioColors[task.priority] || prioColors.Medium;

    return (
      <div
        key={task._id}
        draggable
        onDragStart={(e) => handleDragStart(e, task._id)}
        className="flex flex-col bg-white dark:bg-darkbg-800 p-4 rounded-xl border border-gray-200/60 dark:border-gray-800/80 shadow-premium hover:shadow-md cursor-grab active:cursor-grabbing hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 select-none"
      >
        {/* Card header */}
        <div className="flex items-start justify-between gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${priorityClass}`}>
            {(task.priority || 'Medium')} Priority
          </span>
          
          {/* Task operations for project Admin */}
          {user?.role === 'Admin' && isProjectAdmin && (
            <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity">
              <button
                onClick={() => openEditTask(task)}
                className="p-1 rounded text-gray-500 hover:text-primary-500 hover:bg-gray-50 dark:hover:bg-darkbg-700/50"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDeleteTask(task._id)}
                className="p-1 rounded text-gray-500 hover:text-rose-500 hover:bg-gray-50 dark:hover:bg-darkbg-700/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Task core details */}
        <h4 className="text-sm font-bold text-gray-800 dark:text-white mt-2 leading-snug">
          {task.title}
        </h4>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
          {task.description || 'No description added.'}
        </p>

        {/* Card footer details */}
        <div className="mt-4 border-t border-gray-50 dark:border-gray-850/50 pt-3 flex items-center justify-between text-[11px] font-semibold">
          {/* Due date indicator */}
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-rose-500 animate-pulse' : 'text-gray-400'}`}>
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(task.dueDate)}</span>
            {isOverdue && <span className="text-[9px] uppercase font-bold tracking-wider">Overdue</span>}
          </div>

          {/* Assignee Avatar */}
          <div className="flex items-center gap-1">
            {task.assignedTo && typeof task.assignedTo === 'object' && task.assignedTo.name ? (
              <div 
                title={`Assigned to ${task.assignedTo.name}`}
                className="w-5.5 h-5.5 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center text-[9px] dark:bg-primary-950/20 dark:text-primary-400"
              >
                {String(task.assignedTo.name).charAt(0).toUpperCase()}
              </div>
            ) : task.assignedTo && typeof task.assignedTo === 'string' ? (
              <div 
                title={`Assigned to Member (ID: ${task.assignedTo.substring(0, 6)})`}
                className="w-5.5 h-5.5 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center text-[9px] dark:bg-primary-950/20 dark:text-primary-400"
              >
                M
              </div>
            ) : (
              <span className="text-[10px] text-gray-400 font-medium">
                Unassigned
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Upper Meta header */}
      <div className="bg-white dark:bg-darkbg-800 p-6 rounded-2xl border border-gray-150/40 dark:border-gray-800/80 shadow-premium dark:shadow-premium-dark flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-primary-500 uppercase tracking-wider bg-primary-50 dark:bg-primary-500/10 px-2 py-0.5 rounded-md">Project Hub</span>
            <p className="text-xs text-gray-400 font-medium">Created by {project.createdBy?.name || 'Admin'}</p>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight">{project.name}</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 max-w-2xl font-medium">{project.description || 'No project scope defined.'}</p>
        </div>

        {/* Member list and quick buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setMemberModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 dark:bg-darkbg-700 dark:hover:bg-darkbg-600 dark:text-gray-200 dark:border-gray-800 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4 text-gray-400" />
            <span>{project.members?.length || 0} Members</span>
          </button>

          {user?.role === 'Admin' && isProjectAdmin && (
            <button
              onClick={() => resetTaskForm() || setTaskModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white shadow-premium active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left column - Members Sidebar inside Project detail */}
        <div className="xl:col-span-1 bg-white dark:bg-darkbg-800 p-5 rounded-2xl border border-gray-150/40 dark:border-gray-800/80 shadow-premium dark:shadow-premium-dark space-y-5 h-fit">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50 pb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">Project Members</h3>
            {user?.role === 'Admin' && isProjectAdmin && (
              <button
                onClick={() => setMemberModalOpen(true)}
                className="text-[11px] font-bold text-primary-500 hover:underline flex items-center gap-0.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Invite
              </button>
            )}
          </div>

          <ul className="space-y-3">
            {project.members?.map((member) => {
              if (!member) return null;
              const memberId = member._id || (typeof member === 'string' ? member : null);
              if (!memberId) return null;
              
              const memberName = member.name || (typeof member === 'string' ? 'Member' : 'Unknown User');
              const memberRole = member.role || (typeof member === 'string' ? 'Member' : 'Collaborator');
              const isCreator = memberId === (project.createdBy?._id || project.createdBy);
              
              return (
                <li key={memberId} className="flex items-center justify-between group p-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-darkbg-900/20 transition-all">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-indigo-100/10">
                      {String(memberName).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">{memberName}</p>
                      <p className="text-[10px] text-gray-400 truncate flex items-center gap-0.5">
                        {isCreator && <Shield className="w-3 h-3 text-amber-500" />}
                        {isCreator ? 'Owner' : memberRole}
                      </p>
                    </div>
                  </div>

                  {/* Remove option for Admin users */}
                  {user?.role === 'Admin' && isProjectAdmin && !isCreator && memberId !== user?.id && (
                    <button
                      onClick={() => handleRemoveMember(memberId)}
                      className="p-1 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove Member"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right Columns: Kanban Board */}
        <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* PENDING COLUMN */}
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'Pending')}
            className="flex flex-col min-h-[450px] bg-gray-50/50 dark:bg-darkbg-800/10 border border-gray-150/40 dark:border-gray-800/80 rounded-2xl p-4 transition-colors duration-200"
          >
            <div className="flex items-center justify-between mb-4 border-b border-gray-200/50 dark:border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-400 dark:bg-gray-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Pending</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200/50 dark:bg-darkbg-700 text-gray-600 dark:text-gray-300">
                {pendingTasks.length}
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto">
              {pendingTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400 dark:text-gray-500 font-medium">Empty column</div>
              ) : (
                pendingTasks.map(t => renderTaskCard(t))
              )}
            </div>
          </div>

          {/* IN PROGRESS COLUMN */}
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'In Progress')}
            className="flex flex-col min-h-[450px] bg-gray-50/50 dark:bg-darkbg-800/10 border border-gray-150/40 dark:border-gray-800/80 rounded-2xl p-4 transition-colors duration-200"
          >
            <div className="flex items-center justify-between mb-4 border-b border-gray-200/50 dark:border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">In Progress</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-150/10">
                {inProgressTasks.length}
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto">
              {inProgressTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400 dark:text-gray-500 font-medium">Empty column</div>
              ) : (
                inProgressTasks.map(t => renderTaskCard(t))
              )}
            </div>
          </div>

          {/* COMPLETED COLUMN */}
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'Completed')}
            className="flex flex-col min-h-[450px] bg-gray-50/50 dark:bg-darkbg-800/10 border border-gray-150/40 dark:border-gray-800/80 rounded-2xl p-4 transition-colors duration-200"
          >
            <div className="flex items-center justify-between mb-4 border-b border-gray-200/50 dark:border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Completed</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-150/10">
                {completedTasks.length}
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto">
              {completedTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400 dark:text-gray-500 font-medium">Empty column</div>
              ) : (
                completedTasks.map(t => renderTaskCard(t))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Task card helper is defined in component body */}

      {/* TASK MODAL (CREATE AND EDIT) */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 dark:bg-black/50 backdrop-blur-sm" onClick={resetTaskForm} />
          
          <div className="bg-white dark:bg-darkbg-800 p-6 rounded-2xl border border-gray-150/40 dark:border-gray-800/80 shadow-premium dark:shadow-premium-dark w-full max-w-md z-10 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50 pb-3 mb-5">
              <h3 className="font-extrabold text-base text-gray-800 dark:text-white">
                {editingTask ? 'Edit Workspace Task' : 'Add Project Task'}
              </h3>
              <button
                onClick={resetTaskForm}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-darkbg-700/50 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 px-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Code API routes"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm font-medium border border-gray-200 focus:border-primary-500 bg-gray-50/50 dark:bg-darkbg-900/30 dark:border-gray-800 dark:focus:border-primary-500 outline-none text-gray-800 dark:text-gray-105 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 px-1">
                  Description
                </label>
                <textarea
                  placeholder="Outline the detailed guidelines for this task..."
                  rows="3"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm font-medium border border-gray-200 focus:border-primary-500 bg-gray-50/50 dark:bg-darkbg-900/30 dark:border-gray-800 dark:focus:border-primary-500 outline-none text-gray-800 dark:text-gray-105 transition-all resize-none animate-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 px-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-gray-50/50 dark:bg-darkbg-900/30 dark:border-gray-800 outline-none text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 px-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-sm font-medium border border-gray-200 bg-gray-50/50 dark:bg-darkbg-900/30 dark:border-gray-800 outline-none text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 px-1">
                  Assignee
                </label>
                <select
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-gray-50/50 dark:bg-darkbg-900/30 dark:border-gray-800 outline-none text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {project.members?.map(m => {
                    if (!m) return null;
                    const mId = m._id || (typeof m === 'string' ? m : null);
                    if (!mId) return null;
                    const mName = m.name || (typeof m === 'string' ? `Member (ID: ${mId.substring(0, 6)})` : 'Unknown');
                    const mEmail = m.email ? ` (${m.email})` : '';
                    return (
                      <option key={mId} value={mId}>{mName}{mEmail}</option>
                    );
                  })}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800/50 mt-4">
                <button
                  type="button"
                  onClick={resetTaskForm}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-darkbg-700 border border-gray-200 dark:border-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white shadow-premium active:scale-[0.98] transition-all cursor-pointer"
                >
                  {formLoading ? 'Processing...' : editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEMBER INVITE MODAL */}
      {memberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 dark:bg-black/50 backdrop-blur-sm" onClick={() => setMemberModalOpen(false)} />
          
          <div className="bg-white dark:bg-darkbg-800 p-6 rounded-2xl border border-gray-150/40 dark:border-gray-800/80 shadow-premium dark:shadow-premium-dark w-full max-w-sm z-10 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50 pb-3 mb-5">
              <h3 className="font-extrabold text-base text-gray-800 dark:text-white">Invite Project Member</h3>
              <button
                onClick={() => setMemberModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-darkbg-700/50 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 px-1">
                  Member's Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="team.member@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm font-medium border border-gray-200 focus:border-primary-500 bg-gray-50/50 dark:bg-darkbg-900/30 dark:border-gray-800 dark:focus:border-primary-500 outline-none text-gray-800 dark:text-gray-105 transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-darkbg-700 border border-gray-200 dark:border-gray-800 transition-colors"
                >
                  Close
                </button>
                {user?.role === 'Admin' && isProjectAdmin && (
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white shadow-premium active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {inviteLoading ? 'Inviting...' : 'Send Invitation'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
