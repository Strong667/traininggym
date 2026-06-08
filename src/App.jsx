import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import NavBar from './components/NavBar';
import Today from './pages/Today';
import Library from './pages/Library';
import ExerciseDetail from './pages/ExerciseDetail';
import Stats from './pages/Stats';
import AIPlan from './pages/AIPlan';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
          <Routes>
            <Route path="/" element={<Today />} />
            <Route path="/library" element={<Library />} />
            <Route path="/library/:id" element={<ExerciseDetail />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/ai-plan" element={<AIPlan />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <NavBar />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
