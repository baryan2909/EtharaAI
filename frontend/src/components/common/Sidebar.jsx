import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import API from '../../services/api';
import { 
  LayoutDashboard, 
  FolderOpen, 
  CheckSquare, 
  User, 
  LogOut, 
  Sun, 
  Moon, 
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Layers
} from 'lucide-react';
import { useEffect } from 'react';

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchSidebarProjects = async () => {
      if (user) {
        try {
          const res = await API.get('/projects');
          setProjects(res.data.data.slice(0, 5));
        } catch (error) {
          console.error('Error fetching sidebar projects:', error);
        }
      }
    };
    fetchSidebarProjects();
  }, [user, location.pathname]);

  const navItems = [
    { name: 'Dashboard',  path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects',   path: '/projects',  icon: FolderOpen },
    { name: 'Tasks',      path: '/tasks',      icon: CheckSquare },
    { name: 'Profile',    path: '/profile',    icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get user initials for avatar fallback
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen flex flex-col
        bg-white dark:bg-darkbg-800
        border-r border-warm-200/70 dark:border-darkbg-700
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-[68px]' : 'w-60'}`}
    >

      {/* ── Logo ── */}
      <div className={`flex items-center h-16 border-b border-warm-100 dark:border-darkbg-700 px-4 flex-shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-warm-900 dark:text-warm-100 truncate">
              CollabFlow
            </span>
          </Link>
        )}
        {isCollapsed && (
          <Link to="/dashboard" className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg text-warm-400 hover:text-warm-700 dark:hover:text-warm-200
            hover:bg-warm-100 dark:hover:bg-darkbg-700 transition-colors flex-shrink-0
            ${isCollapsed ? 'hidden' : 'block'}`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Expand button when collapsed */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="mx-auto mt-3 p-1.5 rounded-lg text-warm-400 hover:text-warm-700 dark:hover:text-warm-200
            hover:bg-warm-100 dark:hover:bg-darkbg-700 transition-colors"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-0.5">

        {/* Main nav items */}
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              title={isCollapsed ? item.name : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150
                ${isCollapsed ? 'justify-center' : ''}
                ${isActive ? 'nav-active' : 'nav-inactive'}`
              }
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}

        {/* Projects shortcut list */}
        {!isCollapsed && projects.length > 0 && (
          <div className="pt-5 pb-1">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[11px] font-semibold text-warm-400 dark:text-warm-500 uppercase tracking-widest">
                Projects
              </span>
              {user?.role === 'Admin' && (
                <Link
                  to="/projects"
                  className="text-warm-400 hover:text-primary-500 transition-colors"
                  title="Manage projects"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
            <ul className="space-y-0.5">
              {projects.map((proj) => (
                <li key={proj._id}>
                  <Link
                    to={`/projects/${proj._id}`}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-sm rounded-lg
                      text-warm-500 dark:text-warm-400 hover:text-warm-900 dark:hover:text-warm-100
                      hover:bg-warm-100 dark:hover:bg-darkbg-700 transition-all"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                    <span className="truncate">{proj.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* ── Footer ── */}
      <div className="border-t border-warm-100 dark:border-darkbg-700 p-2.5 space-y-0.5 flex-shrink-0">

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm
            nav-inactive transition-all ${isCollapsed ? 'justify-center' : ''}`}
        >
          {theme === 'dark'
            ? <Sun className="w-[18px] h-[18px] text-amber-400 flex-shrink-0" />
            : <Moon className="w-[18px] h-[18px] flex-shrink-0" />
          }
          {!isCollapsed && (
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Log out"
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm
            text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/20
            transition-all ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!isCollapsed && <span>Log out</span>}
        </button>

        {/* User card */}
        {!isCollapsed && user && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-lg bg-warm-50 dark:bg-darkbg-700 border border-warm-100 dark:border-darkbg-600">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-warm-200 dark:ring-darkbg-600 flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-semibold text-xs flex items-center justify-center flex-shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-warm-800 dark:text-warm-200 truncate">{user.name}</p>
              <p className="text-[10px] text-warm-400 dark:text-warm-500 truncate">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
