import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Makkara from './games/makkara/Makkara';
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
            <Route path="/makkara" element={<Makkara />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
