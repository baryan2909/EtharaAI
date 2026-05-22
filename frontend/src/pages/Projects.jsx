import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { Spinner } from '../components/common/Spinner';
import { FolderOpen, Plus, User, Users, ArrowUpRight, X, Trash2 } from 'lucide-react';

export default function Projects() {
  const { user }       = useAuth();
  const { showToast }  = useToast();

  const [projects, setProjects]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modalOpen, setModalOpen]     = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await API.get('/projects');
      setProjects(res.data.data);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    setFormLoading(true);
    try {
      await API.post('/projects', { name: projectName, description: projectDesc });
      showToast('Project created!', 'success');
      setProjectName(''); setProjectDesc(''); setModalOpen(false);
      fetchProjects();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProject = async (projectId, e) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await API.delete(`/projects/${projectId}`);
      showToast('Project deleted', 'success');
      fetchProjects();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-warm-900 dark:text-warm-100">Projects</h2>
          <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
            {projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace
          </p>
        </div>
        {user?.role === 'Admin' && (
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 card text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-warm-100 dark:bg-darkbg-700 text-warm-400 flex items-center justify-center">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-warm-800 dark:text-warm-200">No projects yet</h4>
            <p className="text-xs text-warm-400 max-w-xs mt-1">
              {user?.role === 'Admin'
                ? 'Create your first project to start collaborating with your team.'
                : 'Ask your admin to add you to a project.'}
            </p>
          </div>
          {user?.role === 'Admin' && (
            <button onClick={() => setModalOpen(true)} className="btn-secondary text-xs">
              Create a project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => {
            const isOwner = proj.createdBy?._id === user?.id || proj.createdBy === user?.id;
            return (
              <Link
                key={proj._id}
                to={`/projects/${proj._id}`}
                className="group relative card card-hover flex flex-col justify-between p-5
                  hover:border-primary-200 dark:hover:border-primary-900/40 transition-all duration-200"
              >
                {/* Top */}
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20
                      text-primary-500 flex items-center justify-center">
                      <FolderOpen className="w-4.5 h-4.5" />
                    </div>
                    {user?.role === 'Admin' && isOwner && (
                      <button
                        onClick={(e) => handleDeleteProject(proj._id, e)}
                        className="p-1.5 rounded-lg text-warm-300 hover:text-danger-500
                          hover:bg-danger-50 dark:hover:bg-danger-950/20 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-warm-900 dark:text-warm-100
                    group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-warm-400 dark:text-warm-500 mt-1.5 line-clamp-2">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                {/* Footer */}
                <div className="mt-5 pt-4 border-t border-warm-100 dark:border-darkbg-700
                  flex items-center justify-between text-xs text-warm-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{proj.members?.length || 0} member{proj.members?.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1 truncate max-w-[130px]">
                    <User className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{proj.createdBy?.name || 'Admin'}</span>
                  </div>
                </div>

                {/* Arrow on hover */}
                <ArrowUpRight className="absolute top-4 right-4 w-3.5 h-3.5 text-warm-300
                  opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })}
        </div>
      )}

      {/* Create project modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-warm-900/40 dark:bg-black/50 backdrop-blur-sm"
            onClick={() => setModalOpen(false)} />

          <div className="card w-full max-w-md z-10 animate-fade-in p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-warm-900 dark:text-warm-100">New Project</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-warm-400 hover:text-warm-600 dark:hover:text-warm-200
                  hover:bg-warm-100 dark:hover:bg-darkbg-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-warm-600 dark:text-warm-400">
                  Project name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Redesign"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-warm-600 dark:text-warm-400">
                  Description <span className="text-warm-400 font-normal">(optional)</span>
                </label>
                <textarea
                  placeholder="What is this project about?"
                  rows="3"
                  value={projectDesc}
                  onChange={e => setProjectDesc(e.target.value)}
                  className="input resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-sm py-2">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="btn-primary text-sm py-2 disabled:opacity-60">
                  {formLoading ? 'Creating...' : 'Create project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
