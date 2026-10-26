import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, LogIn } from 'lucide-react';
import { Button } from '../components/common/Button';

export const AccessDeniedPage: React.FC = () => {
  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-2xs">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
            403 Forbidden
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] pt-2">
            Access Denied
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            You do not have the required permissions to access this administrative or protected resource.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full" leftIcon={<Home className="w-4 h-4" />}>
              Return Home
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full" leftIcon={<LogIn className="w-4 h-4" />}>
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
