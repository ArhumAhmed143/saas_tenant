import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import '../../styles/global.css';

export default function Login() {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success] = useState(() => {
    const flash = sessionStorage.getItem('flashMessage');
    if (flash) {
      sessionStorage.removeItem('flashMessage');
      return flash;
    }
    return location.state?.message || '';
  });
  const [capsLock, setCapsLock] = useState(false);
  const { login, isLoading, currentUser } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && localStorage.getItem('accessToken')) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to your Multi-Tenant SaaS account</p>

        {success && (
          <div style={{
            background: '#dcfce7',
            color: '#166534',
            border: '1px solid #bbf7d0',
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            fontSize: '0.88rem',
            lineHeight: 1.4
          }}>
            {success}
          </div>
        )}

        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="you@company.com" 
              required 
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password" 
                required 
                onKeyDown={(e) => setCapsLock(e.getModifierState('CapsLock'))}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {capsLock && <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>⚠️ Caps Lock is on</span>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              Remember me
            </label>
            <Link to="/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem' }}>Forgot Password?</Link>
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? '⏳ Signing in...' : 'Sign In'}
          </button>
        </form>


        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--gray-500)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}