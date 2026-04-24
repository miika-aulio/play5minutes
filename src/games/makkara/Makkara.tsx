import { Link } from 'react-router-dom';

export default function Makkara() {
  return (
    <div className="placeholder">
      <h2>Sausage</h2>
      <p>The game will live here.</p>
      <Link to="/" className="back-link">← back</Link>
    </div>
  );
}
