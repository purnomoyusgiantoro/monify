
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import Team from './pages/Team';
import Dashboard from './pages/Dashboard';
import Transaksi from './pages/Transaksi';
import Budget from './pages/Budget';
import Prediksi from './pages/Prediksi';
import Laporan from './pages/Laporan';
import Profil from './pages/Profil';

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
          <Route path="/laporan" element={<Laporan />} />
          <Route path="/profil" element={<Profil />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
