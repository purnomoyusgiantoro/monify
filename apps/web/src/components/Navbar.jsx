import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">💰</span>
          <span className="brand-text">MONIFY</span>
        </Link>

        <ul className="navbar-links">
          <li>
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/ai-analysis"
              className={`nav-link ${location.pathname === '/ai-analysis' ? 'active' : ''}`}
            >
              AI Analysis
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
