import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { AppProvider } from './context/AppContext';
import { MusicProvider } from './context/MusicContext';
import NavBar from './components/NavBar';
import MusicPlayer from './components/MusicPlayer';
import ProfileSelect from './pages/ProfileSelect';
import AdminPanel from './pages/AdminPanel';
import Today from './pages/Today';
import Library from './pages/Library';
import ExerciseDetail from './pages/ExerciseDetail';
import Stats from './pages/Stats';
import AIPlan from './pages/AIPlan';
import Settings from './pages/Settings';

function AppInner() {
  const { activeProfileId } = useAuth();
  const { isAdminLoggedIn } = useAdmin();

  if (isAdminLoggedIn) return <AdminPanel />;
  if (!activeProfileId)  return <ProfileSelect />;

  return (
    <AppProvider>
      <MusicProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-nav">
            <Routes>
              <Route path="/"            element={<Today />} />
              <Route path="/library"     element={<Library />} />
              <Route path="/library/:id" element={<ExerciseDetail />} />
              <Route path="/stats"       element={<Stats />} />
              <Route path="/ai-plan"     element={<AIPlan />} />
              <Route path="/settings"    element={<Settings />} />
              <Route path="*"            element={<Navigate to="/" replace />} />
            </Routes>
            <MusicPlayer />
            <NavBar />
          </div>
        </BrowserRouter>
      </MusicProvider>
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <AppInner />
      </AdminProvider>
    </AuthProvider>
  );
}
