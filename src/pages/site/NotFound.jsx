import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="sec">
      <div className="wrap" style={{ textAlign: 'center' }}>
        <h1>404 — Page not found</h1>
        <p style={{ marginTop: 14 }}><Link className="btn btn-primary" to="/">Back Home</Link></p>
      </div>
    </section>
  );
}
