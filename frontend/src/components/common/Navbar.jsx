import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, LogOut, User, ChevronDown } from 'lucide-react';

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard',       sub: 'Your workspace at a glance' },
  '/projects':  { title: 'Projects',        sub: 'All your active projects' },
  '/tasks':     { title: 'Tasks',           sub: 'Your assigned work' },
  '/profile':   { title: 'Account',         sub: 'Manage your profile' },
};

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getPageMeta = () => {
    const path = location.pathname;
    if (path.startsWith('/projects/')) return { title: 'Project Board', sub: 'Kanban & team view' };
    const match = Object.keys(PAGE_TITLES).find(k => path.startsWith(k));
    return match ? PAGE_TITLES[match] : { title: 'Dashboard', sub: '' };
  };

  const { title, sub } = getPageMeta();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-14 flex items-center justify-between
      px-6 bg-white/90 dark:bg-darkbg-800/90 backdrop-blur-sm
      border-b border-warm-200/60 dark:border-darkbg-700">

      {/* Page title */}
      <div>
        <h1 className="text-sm font-semibold text-warm-900 dark:text-warm-100 leading-tight">
          {title}
        </h1>
        <p className="text-xs text-warm-400 dark:text-warm-500 leading-tight">{sub}</p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">

        {/* Search — decorative */}
        <div className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg
          bg-warm-50 dark:bg-darkbg-700 border border-warm-200/80 dark:border-darkbg-600
          text-warm-400 w-52">
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            disabled
            className="flex-1 bg-transparent border-none outline-none text-xs text-warm-500 cursor-not-allowed"
          />
          <kbd className="text-[10px] bg-warm-100 dark:bg-darkbg-600 px-1 rounded text-warm-400">⌘K</kbd>
        </div>

        {/* Notification bell */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg
          text-warm-400 hover:text-warm-700 dark:hover:text-warm-200
          hover:bg-warm-100 dark:hover:bg-darkbg-700 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary-500" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-warm-200 dark:bg-darkbg-600" />

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 h-8 pl-1 pr-2 rounded-lg
              hover:bg-warm-100 dark:hover:bg-darkbg-700 transition-colors"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40
                text-primary-600 dark:text-primary-400 font-semibold text-[10px]
                flex items-center justify-center flex-shrink-0">
                {initials}
              </div>
            )}
            <span className="hidden sm:block text-xs font-medium text-warm-700 dark:text-warm-300">
              {user?.name?.split(' ')[0]}
            </span>
            <ChevronDown className={`w-3 h-3 text-warm-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 z-30 w-44 rounded-xl
                border border-warm-200 dark:border-darkbg-600
                bg-white dark:bg-darkbg-800 shadow-lg animate-fade-in overflow-hidden">

                {/* User info */}
                <div className="px-3 py-2.5 border-b border-warm-100 dark:border-darkbg-700">
                  <p className="text-xs font-semibold text-warm-800 dark:text-warm-200">{user?.name}</p>
                  <p className="text-[10px] text-warm-400 truncate">{user?.email}</p>
                </div>

                <div className="p-1">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs
                      text-warm-600 dark:text-warm-400 hover:bg-warm-50 dark:hover:bg-darkbg-700
                      hover:text-warm-900 dark:hover:text-warm-100 transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    My Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-lg text-xs
                      text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/20 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
