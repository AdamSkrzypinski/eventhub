import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, LogOut, ShieldCheck, Ticket, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-400">
          <Calendar className="w-6 h-6" />
          <span>EventHub</span>
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-indigo-400 transition-colors">
            Wydarzenia
          </Link>

          {user ? (
            <>
              <Link
                to="/my-reservations"
                className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors"
              >
                <Ticket className="w-4 h-4" />
                Moje rezerwacje
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Panel Admina
                </Link>
              )}

              <div className="flex items-center gap-4 pl-4 border-l border-slate-700">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <User className="w-4 h-4" />
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Wyloguj
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Logowanie
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                Rejestracja
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};