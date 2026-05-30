
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import Team from './pages/Team';
import Dashboard from './pages/Dashboard';
import Transaksi from './pages/Transaksi';
import Budget from './pages/Budget';
import Prediksi from './pages/Prediksi';
import Setting from './pages/Setting';
import Sertifikat from './pages/Sertifikat';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/team" element={<Team />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transaksi" element={<Transaksi />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/prediksi" element={<Prediksi />} />
          <Route path="/sertifikat" element={<Sertifikat />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/profil" element={<Navigate to="/setting" replace />} />
          <Route path="/laporan" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
