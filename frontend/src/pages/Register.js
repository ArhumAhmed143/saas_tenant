import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../styles/global.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', organizationName: '', email: '', password: '', confirmPassword: '' });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register, isLoading } = useApp();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(form.password);
  const strengthLabels = ['', 'Weak', 'Medium', 'Strong', 'Very Strong'];
  const strengthColors = ['', '#ef4444', '#f59e0b', '#22c55e', '#22c55e'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (!agree) return setError('You must agree to Terms');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    
    try {
      await register(form);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const slug = form.organizationName.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <h2>Create Your Account</h2>
        <p className="subtitle">Start your free trial. No credit card required.</p>

        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>}
        {success && <div style={{ background: '#dcfce7', color: '#16a34a', padding: 12, borderRadius: 8, marginBottom: 16 }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
          </div>

          <div className="input-group">
            <label>Organization Name</label>
            <input name="organizationName" value={form.organizationName} onChange={handleChange} placeholder="Your Company Ltd" required />
            {form.organizationName && <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 4 }}>🔗 {slug}.yourapp.com</div>}
          </div>

          <div className="input-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@company.com" required />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Create a strong password" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {form.password && (
              <>
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  <div className="password-strength" style={{ width: `${(strength/4)*100}%`, background: strengthColors[strength] }}></div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 2 }}>{strengthLabels[strength]}</div>
              </>
            )}
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required />
              I agree to the <Link to="/terms" style={{ color: 'var(--primary)' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: 'var(--primary)' }}>Privacy Policy</Link>
            </label>
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? '⏳ Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="divider">
          <hr /> OR <hr />
        </div>

        <a href="http://localhost:5000/auth/google" style={{ textDecoration: 'none' }}>
          <button className="social-btn" style={{ marginBottom: 8 }}>
            <span>🔵</span> Sign up with Google
          </button>
        </a>

        {/* ✅ GitHub Button DELETE KAR DIYA */}

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--gray-500)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}