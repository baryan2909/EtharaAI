import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { 
  User, Mail, Shield, ShieldAlert, Award, Calendar, 
  CheckSquare, ListTodo, Camera, Edit2, Save, X 
} from 'lucide-react';

export default function Profile() {
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useToast();
  
  const [projectCount, setProjectCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [completedTaskCount, setCompletedTaskCount] = useState(0);

  // Edit profile states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [saveLoading, setSaveLoading] = useState(false);

  // Avatar upload state
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    const fetchProfileStats = async () => {
      try {
        const projRes = await API.get('/projects');
        setProjectCount(projRes.data?.count || projRes.data?.data?.length || 0);

        // Fetch dashboard stats to get task metrics
        const statsRes = await API.get('/dashboard/stats');
        setTaskCount(statsRes.data?.data?.totalTasks || 0);
        setCompletedTaskCount(statsRes.data?.data?.tasksByStatus?.completed || 0);
      } catch (error) {
        console.error('Failed to load profile stats:', error);
      }
    };
    fetchProfileStats();
  }, []);

  // Update edit form states when user shifts
  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
    }
  }, [user]);

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) {
      showToast('Name and email cannot be blank', 'error');
      return;
    }

    setSaveLoading(true);
    try {
      const res = await API.put('/users/profile', {
        name: editName,
        email: editEmail
      });
      
      updateUserProfile(res.data.user);
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (error) {
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 2MB
    if (file.size > 2 * 1024 * 1024) {
      showToast('File size must be less than 2MB', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploadLoading(true);
    try {
      const res = await API.put('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      updateUserProfile(res.data.user);
      showToast('Profile picture updated successfully!', 'success');
    } catch (error) {
      showToast(error.message || 'Avatar upload failed', 'error');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Breadcrumb */}
      <div>
        <h2 className="text-xl font-extrabold text-gray-800 dark:text-white">Account Center</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Manage your personal settings and profile metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-darkbg-800 p-6 rounded-2xl border border-gray-150/40 dark:border-gray-800/80 shadow-premium dark:shadow-premium-dark space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-gray-100 dark:border-gray-800/50">
            
            {/* Clickable Profile Image container */}
            <div className="relative group cursor-pointer flex-shrink-0" onClick={handleAvatarClick}>
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className={`w-20 h-20 rounded-3xl object-cover border border-gray-150/40 dark:border-gray-800 shadow-md ${
                    uploadLoading ? 'opacity-50' : 'group-hover:opacity-85'
                  } transition-opacity duration-200`}
                />
              ) : (
                <div className={`flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary-500 to-indigo-500 text-white font-extrabold text-3xl shadow-lg shadow-primary-500/10 ${
                  uploadLoading ? 'opacity-50' : 'group-hover:opacity-90'
                } transition-opacity duration-200`}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
              )}

              {/* Camera Icon Overlay on Hover */}
              <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="w-5 h-5 text-white" />
              </div>

              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                style={{ display: 'none' }} 
                accept="image/*" 
              />

              {uploadLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-3xl">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            
            <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h3 className="text-xl font-extrabold text-gray-800 dark:text-white truncate">{user?.name}</h3>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider w-fit mx-auto sm:mx-0 ${
                  user?.role === 'Admin'
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/10 dark:text-amber-400 border border-amber-200/20'
                    : 'bg-blue-50 text-blue-600 dark:bg-blue-950/10 dark:text-blue-400 border border-blue-200/20'
                }`}>
                  {user?.role === 'Admin' ? <Shield className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                  {user?.role} Role
                </span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium flex items-center justify-center sm:justify-start gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                {user?.email}
              </p>
            </div>

            {/* Edit Profile Toggle Button */}
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 dark:bg-darkbg-700 dark:hover:bg-darkbg-600 dark:text-gray-250 dark:border-gray-800 transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Details / Edit Profile Form */}
          {isEditing ? (
            <form onSubmit={handleEditProfileSubmit} className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-0.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-sm font-medium border border-gray-200 focus:border-primary-500 bg-gray-50/50 dark:bg-darkbg-900/30 dark:border-gray-800 dark:focus:border-primary-500 outline-none text-gray-800 dark:text-gray-105 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-0.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-sm font-medium border border-gray-200 focus:border-primary-500 bg-gray-50/50 dark:bg-darkbg-900/30 dark:border-gray-800 dark:focus:border-primary-500 outline-none text-gray-800 dark:text-gray-105 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800/50">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-darkbg-700 border border-gray-200 dark:border-gray-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white shadow-premium active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saveLoading ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </form>
          ) : (
            /* Detailed Info Grid (View Mode) */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
              <div className="p-4 rounded-xl border border-gray-150/40 dark:border-gray-800/80 bg-gray-50/30 dark:bg-darkbg-900/10 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Account Role</span>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {user?.role === 'Admin' 
                    ? 'Administrator (Full permissions)' 
                    : 'Workspace Member (Collaborative permissions)'
                  }
                </p>
              </div>

              <div className="p-4 rounded-xl border border-gray-150/40 dark:border-gray-800/80 bg-gray-50/30 dark:bg-darkbg-900/10 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Verified Email</span>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{user?.email}</p>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-amber-500/20 bg-amber-50/10 dark:bg-amber-950/5 p-4 flex gap-3 text-xs text-amber-700 dark:text-amber-400">
            <Award className="w-5 h-5 flex-shrink-0" />
            <div>
              <span className="font-bold">CollabFlow Security Policy:</span>
              <p className="mt-0.5 text-gray-500 dark:text-gray-400">Your profile picture is safely processed and cropped using face-detection technology. Profile modifications instantly propagate to your teammates' synchronized sessions.</p>
            </div>
          </div>
        </div>

        {/* Sidebar Statistics Cards */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-darkbg-800 p-6 rounded-2xl border border-gray-150/40 dark:border-gray-800/80 shadow-premium dark:shadow-premium-dark space-y-5">
            <h4 className="text-sm font-extrabold text-gray-800 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-800/50 pb-2">
              Workspace Summary
            </h4>
            
            <div className="space-y-4">
              {/* Stat 1 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Assigned Projects</p>
                  <p className="text-base font-bold text-gray-800 dark:text-white">{projectCount}</p>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center">
                  <ListTodo className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Total Workspace Tasks</p>
                  <p className="text-base font-bold text-gray-800 dark:text-white">{taskCount}</p>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Done Workspace Tasks</p>
                  <p className="text-base font-bold text-gray-800 dark:text-white">{completedTaskCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
