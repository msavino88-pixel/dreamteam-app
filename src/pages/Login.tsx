import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, session, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111111]">
        <div className="h-8 w-8 border-2 border-white/20 border-t-[var(--accent-lime)] rounded-full animate-spin" />
      </div>
    );
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isSignUp) {
        const { error: err } = await signUp(email, password, fullName);
        if (err) { setError(err); }
        else {
          const { error: signInErr } = await signIn(email, password);
          if (signInErr) setError('Account creato! Controlla la tua email per confermare, poi accedi.');
          else navigate('/');
        }
      } else {
        const { error: err } = await signIn(email, password);
        if (err) setError(err);
        else navigate('/');
      }
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] p-4 sm:p-6">
      <div className="max-w-sm w-full">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <img src="/logo.png" alt="dreamteam" className="h-16 w-16" />
          </div>
          <div>
            <span className="text-3xl font-light tracking-wide text-white">dream</span>
            <span className="text-3xl font-bold tracking-wide text-white">team</span>
          </div>
          <p className="text-[10px] tracking-[0.25em] text-white/25 uppercase mt-1.5">Management Finest</p>
        </div>

        {/* Form */}
        <div className="rounded-[28px] bg-white/[0.04] backdrop-blur-sm p-7">
          <h2 className="text-xl font-semibold text-white mb-1 tracking-tight">
            {isSignUp ? 'Registrati' : 'Accedi'}
          </h2>
          <p className="text-sm text-white/30 mb-7">
            {isSignUp ? 'Crea il tuo account dreamteam' : 'Entra nel tuo spazio di lavoro'}
          </p>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/15 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-label mb-2 block text-white/50 uppercase">Nome Completo</label>
                <Input
                  type="text"
                  placeholder="Mario Rossi"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className="bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/20 rounded-2xl focus:border-[var(--accent-lime)] focus:ring-[var(--accent-lime)]/30"
                />
              </div>
            )}
            <div>
              <label className="text-label mb-2 block text-white/50 uppercase">Email</label>
              <Input
                type="email"
                placeholder="nome@dreamteam.it"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/20 rounded-2xl focus:border-[var(--accent-lime)] focus:ring-[var(--accent-lime)]/30"
              />
            </div>
            <div>
              <label className="text-label mb-2 block text-white/50 uppercase">Password</label>
              <Input
                type="password"
                placeholder={isSignUp ? 'Minimo 6 caratteri' : 'La tua password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/20 rounded-2xl focus:border-[var(--accent-lime)] focus:ring-[var(--accent-lime)]/30"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-[var(--accent-lime)] text-[#111111] hover:brightness-110 hover:shadow-glow font-semibold h-12 text-base mt-2 disabled:opacity-50"
            >
              {submitting ? 'Attendere...' : isSignUp ? 'Crea Account' : 'Accedi'}
            </Button>
            <p className="text-xs text-center text-white/35 pt-1">
              {isSignUp ? 'Hai già un account?' : 'Non hai un account?'}{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className="text-[var(--accent-lime)] hover:text-[var(--accent-lime)]/80 transition-colors font-medium"
              >
                {isSignUp ? 'Accedi' : 'Registrati'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
