import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Grilled from './games/grilled/Grilled';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <Link to="/" className="app-logo">play 5 minutes</Link>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/grilled" element={<Grilled />} />
            {/* Vanhan polun ohjaus uuteen — varmuuden vuoksi */}
            <Route path="/makkara" element={<Navigate to="/grilled" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
