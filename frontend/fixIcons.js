import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'src', 'pages');
const compDir = path.join(process.cwd(), 'src', 'components');

function replaceFile(filePath, processFn) {
  const code = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(filePath, processFn(code));
}

// Sidebar.jsx
replaceFile(path.join(compDir, 'Sidebar.jsx'), code => {
  let newCode = code.replace(
    "import { Link, useLocation } from 'react-router-dom';", 
    "import { Link, useLocation } from 'react-router-dom';\nimport { Home, PlusCircle, Target, Bot, BarChart2, Settings } from 'lucide-react';"
  );
  newCode = newCode.replace(
    /const navs = \[\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\];/s,
    `const navs = [
    { path: '/dashboard', icon: <Home size={22} strokeWidth={2.5} />, label: 'Dashboard' },
    { path: '/transaksi', icon: <PlusCircle size={22} strokeWidth={2.5} />, label: 'Transaksi' },
    { path: '/budget', icon: <Target size={22} strokeWidth={2.5} />, label: 'Budget' },
    { path: '/prediksi', icon: <Bot size={22} strokeWidth={2.5} />, label: 'Prediksi AI' },
    { path: '/laporan', icon: <BarChart2 size={22} strokeWidth={2.5} />, label: 'Laporan' },
    { path: '/profil', icon: <Settings size={22} strokeWidth={2.5} />, label: 'Profil' },
  ];`
  );
  return newCode;
});

// Dashboard.jsx
replaceFile(path.join(pagesDir, 'Dashboard.jsx'), code => {
  let newCode = code.replace(
    "import { getState, summary, rupiah } from '../utils/store';", 
    "import { getState, summary, rupiah } from '../utils/store';\nimport { Wallet, CreditCard, Target, Sparkles, Utensils, Car, ShoppingBag, Gamepad2, Wifi, Paperclip, Search } from 'lucide-react';"
  );
  newCode = newCode.replace(
    "const icons = { Makanan:'🍜', Transport:'🛵', Belanja:'🛍️', Hiburan:'🎮', Internet:'📶', Lainnya:'📌' };", 
    "const icons = { Makanan:<Utensils size={20}/>, Transport:<Car size={20}/>, Belanja:<ShoppingBag size={20}/>, Hiburan:<Gamepad2 size={20}/>, Internet:<Wifi size={20}/>, Lainnya:<Paperclip size={20}/> };"
  );
  newCode = newCode.replace(/<div className="search-box">🔎 <input/g, '<div className="search-box"><Search size={18} /> <input');
  newCode = newCode.replace(/<div className="stat-icon">💰<\/div>/g, '<div className="stat-icon"><Wallet size={24}/></div>');
  newCode = newCode.replace(/<div className="stat-icon">💸<\/div>/g, '<div className="stat-icon"><CreditCard size={24}/></div>');
  newCode = newCode.replace(/<div className="stat-icon">🎯<\/div>/g, '<div className="stat-icon"><Target size={24}/></div>');
  newCode = newCode.replace(/<div className="stat-icon">🔮<\/div>/g, '<div className="stat-icon"><Sparkles size={24}/></div>');
  return newCode;
});

// Budget.jsx
replaceFile(path.join(pagesDir, 'Budget.jsx'), code => {
  let newCode = code.replace(
    "import { getState, setState, summary, rupiah, toast, timestamp } from '../utils/store';", 
    "import { getState, setState, summary, rupiah, toast, timestamp } from '../utils/store';\nimport { Target, CreditCard, Leaf, Bot, Flame, Calculator, CheckCircle } from 'lucide-react';"
  );
  newCode = newCode.replace(/<div className="stat-icon">🎯<\/div>/g, '<div className="stat-icon"><Target size={24}/></div>');
  newCode = newCode.replace(/<div className="stat-icon">💸<\/div>/g, '<div className="stat-icon"><CreditCard size={24}/></div>');
  newCode = newCode.replace(/<div className="stat-icon">🧘<\/div>/g, '<div className="stat-icon"><Leaf size={24}/></div>');
  newCode = newCode.replace(/<div className="stat-icon">🤖<\/div>/g, '<div className="stat-icon"><Bot size={24}/></div>');
  newCode = newCode.replace(/\['🔥','🎯','🧮'\]\[i\] \|\| '✅'/g, "[<Flame size={18}/>, <Target size={18}/>, <Calculator size={18}/>][i] || <CheckCircle size={18}/>");
  return newCode;
});

// Prediksi.jsx
replaceFile(path.join(pagesDir, 'Prediksi.jsx'), code => {
  let newCode = code.replace(
    "import { getState, summary, rupiah, toast, timestamp } from '../utils/store';", 
    "import { getState, summary, rupiah, toast, timestamp } from '../utils/store';\nimport { Tags, TrendingUp, ShieldAlert, Target, Calculator, Receipt, Heart } from 'lucide-react';"
  );
  newCode = newCode.replace(/<i>🏷️<\/i>/g, "<i><Tags size={24}/></i>");
  newCode = newCode.replace(/<i>📈<\/i>/g, "<i><TrendingUp size={24}/></i>");
  newCode = newCode.replace(/<i>🛡️<\/i>/g, "<i><ShieldAlert size={24}/></i>");
  newCode = newCode.replace(/\['🎯','🧮','🧾','💚'\]\[i\]/g, "[<Target size={18}/>, <Calculator size={18}/>, <Receipt size={18}/>, <Heart size={18}/>][i]");
  return newCode;
});

// Laporan.jsx
replaceFile(path.join(pagesDir, 'Laporan.jsx'), code => {
  let newCode = code.replace(
    "import { getState, summary, rupiah } from '../utils/store';", 
    "import { getState, summary, rupiah } from '../utils/store';\nimport { CreditCard, Wallet, Flame, Receipt, Paperclip, Brain } from 'lucide-react';"
  );
  newCode = newCode.replace(/<div className="stat-icon">💸<\/div>/g, '<div className="stat-icon"><CreditCard size={24}/></div>');
  newCode = newCode.replace(/<div className="stat-icon">💰<\/div>/g, '<div className="stat-icon"><Wallet size={24}/></div>');
  newCode = newCode.replace(/<div className="stat-icon">🔥<\/div>/g, '<div className="stat-icon"><Flame size={24}/></div>');
  newCode = newCode.replace(/<div className="stat-icon">🧾<\/div>/g, '<div className="stat-icon"><Receipt size={24}/></div>');
  newCode = newCode.replace(/<i>📌<\/i>/g, "<i><Paperclip size={18}/></i>");
  newCode = newCode.replace(/<i>🔥<\/i>/g, "<i><Flame size={18}/></i>");
  newCode = newCode.replace(/<i>🧠<\/i>/g, "<i><Brain size={18}/></i>");
  return newCode;
});

// Landing.jsx
replaceFile(path.join(pagesDir, 'Landing.jsx'), code => {
  let newCode = code.replace(
    "import Navbar from '../components/Navbar';", 
    "import Navbar from '../components/Navbar';\nimport { Search, BarChart3, ShieldAlert, CheckCircle } from 'lucide-react';"
  );
  newCode = newCode.replace(/<div className="feature-icon">⌕<\/div>/g, '<div className="feature-icon"><Search size={24}/></div>');
  newCode = newCode.replace(/<div className="feature-icon">▣<\/div>/g, '<div className="feature-icon"><BarChart3 size={24}/></div>');
  newCode = newCode.replace(/<div className="feature-icon">◇<\/div>/g, '<div className="feature-icon"><ShieldAlert size={24}/></div>');
  newCode = newCode.replace(/<div className="feature-icon">✓<\/div>/g, '<div className="feature-icon"><CheckCircle size={24}/></div>');
  return newCode;
});

console.log('Icons updated successfully.');
