import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Grilled from './games/grilled/Grilled';
import Home from './pages/Home';
import './App.css';

// Reititys:
// "/"           -> "/grilled" (peli on p\u00e4\u00e4sis\u00e4lt\u00f6, ei erillist\u00e4 etusivua)
// "/grilled"    -> peli
// "/home"       -> vanha etusivu (s\u00e4ilytetty mahdollista tulevaa laajennusta varten)
// "/makkara"    -> "/grilled" (vanha URL)

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <Link to="/grilled" className="app-logo">play 5 minutes</Link>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/grilled" replace />} />
            <Route path="/grilled" element={<Grilled />} />
            <Route path="/home" element={<Home />} />
            <Route path="/makkara" element={<Navigate to="/grilled" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
