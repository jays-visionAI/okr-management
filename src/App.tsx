import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyOkr from './pages/MyOkr';
import TeamOkr from './pages/TeamOkr';
import OkrDetail from './pages/OkrDetail';
import OkrCreate from './pages/OkrCreate';
import ProgressUpdate from './pages/ProgressUpdate';
import AnalysisReport from './pages/AnalysisReport';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="my-okr" element={<MyOkr />} />
          <Route path="team-okr" element={<TeamOkr />} />
          <Route path="okr/:id" element={<OkrDetail />} />
          <Route path="okr/create" element={<OkrCreate />} />
          <Route path="okr/:id/update" element={<ProgressUpdate />} />
          <Route path="analysis" element={<AnalysisReport />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;