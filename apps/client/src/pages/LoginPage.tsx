import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { apiFetch, ApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { AuthResponse } from '@eventhub/shared';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      login(data.token);
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Wystąpił błąd podczas logowania.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Zaloguj się</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Adres e-mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jan@example.com"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Hasło
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium transition-colors cursor-pointer"
        >
          {loading ? 'Logowanie...' : 'Zaloguj się'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Nie masz jeszcze konta?{' '}
        <Link to="/register" className="text-indigo-400 hover:underline">
          Zarejestruj się
        </Link>
      </p>
    </div>
  );
};