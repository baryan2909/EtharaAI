import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Shield, Users, Layers } from 'lucide-react';

export default function Signup() {
  const { signup } = useAuth();
  const navigate   = useNavigate();

  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [role, setRole]               = useState('Member');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLoading(true);
    try {
      await signup(name, email, password, role);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-darkbg-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-7">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-warm-900 dark:text-warm-100">CollabFlow</span>
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold text-warm-900 dark:text-warm-100">Create an account</h1>
          <p className="text-sm text-warm-500 dark:text-warm-400 mt-1">
            Join your team's workspace today
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-warm-600 dark:text-warm-400">
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Smith"
                className="input pl-9"
              />
            </div>
          </div>

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

          {/* Role picker */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-warm-600 dark:text-warm-400">
              Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'Member', icon: Users, desc: 'Update tasks & collaborate' },
                { value: 'Admin',  icon: Shield, desc: 'Create projects & assign tasks' },
              ].map(({ value, icon: Icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={`flex flex-col gap-1 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    role === value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'border-warm-200 dark:border-darkbg-600 hover:bg-warm-50 dark:hover:bg-darkbg-700 text-warm-500 dark:text-warm-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">{value}</span>
                  </div>
                  <span className="text-[10px] leading-snug opacity-75">{desc}</span>
                </button>
              ))}
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
                placeholder="At least 6 characters"
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
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-warm-500 dark:text-warm-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 hover:text-primary-600 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
