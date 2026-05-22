import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, MoveLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkbg-900 overflow-hidden px-4">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary-100/40 dark:bg-primary-950/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-100/40 dark:bg-indigo-950/10 blur-[100px] pointer-events-none" />

      <div className="text-center space-y-6 max-w-md z-10">
        {/* Error Code Bubble */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white dark:bg-darkbg-800 border border-gray-150/40 dark:border-gray-800 shadow-premium dark:shadow-premium-dark text-primary-500 font-extrabold text-4xl leading-none animate-bounce">
          404
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight">
            Lost in CollabFlow Space?
          </h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm mx-auto font-medium">
            The page you are trying to access doesn't exist, has been removed, or is hidden behind workspace security permissions.
          </p>
        </div>

        {/* Home Button */}
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-500 text-white font-semibold text-sm shadow-premium hover:shadow-lg dark:shadow-premium-dark hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <MoveLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
