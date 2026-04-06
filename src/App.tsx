import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppLayout } from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import ClientNew from '@/pages/ClientNew';
import ClientDetail from '@/pages/ClientDetail';
import Projects from '@/pages/Projects';
import ProjectNew from '@/pages/ProjectNew';
import ProjectDetail from '@/pages/ProjectDetail';
import Ideas from '@/pages/Ideas';
import Team from '@/pages/Team';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import MyWork from '@/pages/MyWork';
import Messages from '@/pages/Messages';
import Prospects from '@/pages/Prospects';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={
                  <ProtectedRoute>
                    <NotificationProvider>
                      <AppLayout />
                    </NotificationProvider>
                  </ProtectedRoute>
                }>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/my-work" element={<MyWork />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/clients/new" element={<ClientNew />} />
                  <Route path="/clients/:id" element={<ClientDetail />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/new" element={<ProjectNew />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  <Route path="/ideas" element={<Ideas />} />
                  <Route path="/prospects" element={<Prospects />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
