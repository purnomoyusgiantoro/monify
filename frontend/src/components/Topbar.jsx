
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';

export default function Topbar({ setMobileMenuOpen, title, desc, extraAction }) {
  return (
    <header className="topbar">
      <div>
        <button className="icon-btn mobile-menu" onClick={() => setMobileMenuOpen(prev => !prev)}><Menu size={20} /></button>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      <div className="top-actions">
        {extraAction}
      </div>
    </header>
  );
}
