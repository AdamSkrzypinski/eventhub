import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiFetch, ApiError } from '../lib/api';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Wystąpił błąd podczas rejestracji.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Utwórz konto</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Konto utworzone! Przekierowanie do logowania...</span>
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
            Hasło (min. 6 znaków)
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium transition-colors cursor-pointer"
        >
          {loading ? 'Tworzenie konta...' : 'Zarejestruj się'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Masz już konto?{' '}
        <Link to="/login" className="text-indigo-400 hover:underline">
          Zaloguj się
        </Link>
      </p>
    </div>
  );
};