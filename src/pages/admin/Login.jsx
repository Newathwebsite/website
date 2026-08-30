import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login, isAuthed } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthed) return <Navigate to="/admin" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (await login(username, password)) {
      navigate('/admin');
    } else {
      setError('Incorrect username or password.');
    }
  };

  return (
    <div className="admin-scope a-login-wrap">
      <div className="a-login-card">
        <h1>ATH Content Admin</h1>
        <p className="sub">Sign in to manage projects, pages and site content.</p>
        {error && <div className="a-msg err">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="a-fld">
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
          </div>
          <div className="a-fld">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="hint">Default: admin / ath-admin-2026 — change it under Settings after logging in.</div>
          </div>
          <button className="a-btn a-btn-primary" style={{ width: '100%' }} type="submit">Sign In</button>
        </form>
      </div>
    </div>
  );
}
