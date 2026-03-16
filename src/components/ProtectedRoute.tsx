import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1e]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
