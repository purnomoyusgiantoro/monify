import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AIAnalysis from './pages/AIAnalysis';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ai-analysis" element={<AIAnalysis />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
