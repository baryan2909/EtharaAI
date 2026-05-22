import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Layers } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]       = useState(false);

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fill = (e, p) => { setEmail(e); setPassword(p); };

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-darkbg-900 flex">

      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex lg:w-[42%] bg-primary-500 flex-col justify-between p-12">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-base">CollabFlow</span>
        </div>

        <div className="space-y-5">
          <h2 className="text-3xl font-bold text-white leading-snug">
            Manage your team's work in one place.
          </h2>
          <p className="text-primary-100 text-sm leading-relaxed max-w-xs">
            Projects, tasks, and team collaboration — all in a clean, fast workspace your team will actually enjoy using.
          </p>

          {/* Social proof strip */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex -space-x-2">
              {['S','J','A','M'].map((l, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-primary-500 bg-primary-400 text-white text-[10px] font-bold flex items-center justify-center">
                  {l}
                </div>
              ))}
            </div>
            <p className="text-primary-100 text-xs">
              Trusted by growing teams
            </p>
          </div>
        </div>

        <p className="text-primary-200 text-xs">© 2025 CollabFlow. All rights reserved.</p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-7">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-warm-900 dark:text-warm-100">CollabFlow</span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-2xl font-bold text-warm-900 dark:text-warm-100">Welcome back</h1>
            <p className="text-sm text-warm-500 dark:text-warm-400 mt-1">Sign in to your workspace</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-warm-600 dark:text-warm-400">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="input pl-9"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-warm-600 dark:text-warm-400">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 dark:hover:text-warm-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-1 disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-warm-200 dark:bg-darkbg-600" />
            <span className="text-xs text-warm-400">Demo accounts</span>
            <div className="flex-1 h-px bg-warm-200 dark:bg-darkbg-600" />
          </div>

          {/* Demo quick-fill */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => fill('admin@example.com', 'password123')}
              className="btn-secondary flex-col items-start text-left py-3 h-auto"
            >
              <span className="text-xs font-semibold text-warm-700 dark:text-warm-200">Admin</span>
              <span className="text-[10px] text-warm-400 mt-0.5">Full permissions</span>
            </button>
            <button
              type="button"
              onClick={() => fill('member@example.com', 'password123')}
              className="btn-secondary flex-col items-start text-left py-3 h-auto"
            >
              <span className="text-xs font-semibold text-warm-700 dark:text-warm-200">Member</span>
              <span className="text-[10px] text-warm-400 mt-0.5">Collaborative access</span>
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-warm-500 dark:text-warm-400">
            No account yet?{' '}
            <Link to="/signup" className="text-primary-500 hover:text-primary-600 font-semibold">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
