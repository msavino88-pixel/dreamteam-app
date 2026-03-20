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
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1e]">
        <div className="h-8 w-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
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
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1e] p-4 sm:p-6">
      <div className="max-w-sm w-full">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <svg viewBox="0 0 32 32" className="h-10 w-10 text-white" fill="currentColor">
              <path d="M16 4c-2 0-4 2-5 5s-3 5-5 5c2 0 4 2 5 5s3 5 5 5c2 0 4-2 5-5s3-5 5-5c-2 0-4-2-5-5s-3-5-5-5z" opacity="0.9"/>
              <path d="M8 2c-1 0-2 1-2.5 2.5S4 7 3 7c1 0 2 1 2.5 2.5S7 12 8 12s2-1 2.5-2.5S12 7 13 7c-1 0-2-1-2.5-2.5S9 2 8 2z" opacity="0.5"/>
            </svg>
          </div>
          <div>
            <span className="text-2xl font-light tracking-wide text-white">dream</span>
            <span className="text-2xl font-bold tracking-wide text-white">team</span>
          </div>
          <p className="text-[10px] tracking-[0.25em] text-white/30 uppercase mt-1">Management School</p>
        </div>

        {/* Barra colori */}
        <div className="flex gap-1.5 mb-8 px-8">
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--dt-management)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--dt-marketing)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--dt-finance)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--dt-branding)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--dt-hr)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--dt-ai)' }} />
        </div>

        {/* Form */}
        <div className="rounded-2xl bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-1">
            {isSignUp ? 'Registrati' : 'Accedi'}
          </h2>
          <p className="text-sm text-white/30 mb-6">
            {isSignUp ? 'Crea il tuo account dreamteam' : 'Entra nel tuo spazio di lavoro'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-sm font-medium mb-1.5 block text-white/60">Nome Completo</label>
                <Input
                  type="text"
                  placeholder="Mario Rossi"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus:border-[#9B8EBD] focus:ring-[#9B8EBD]"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1.5 block text-white/60">Email</label>
              <Input
                type="email"
                placeholder="nome@dreamteam.it"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus:border-[#9B8EBD] focus:ring-[#9B8EBD]"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block text-white/60">Password</label>
              <Input
                type="password"
                placeholder={isSignUp ? 'Minimo 6 caratteri' : 'La tua password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus:border-[#9B8EBD] focus:ring-[#9B8EBD]"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-white text-[#1a1a1e] hover:bg-white/90 font-semibold h-11 disabled:opacity-50"
            >
              {submitting ? 'Attendere...' : isSignUp ? 'Crea Account' : 'Accedi'}
            </Button>
            <p className="text-[11px] text-center text-white/40">
              {isSignUp ? 'Hai già un account?' : 'Non hai un account?'}{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className="text-white/70 hover:text-white underline transition-colors"
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
