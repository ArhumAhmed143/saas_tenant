import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from 'axios';
import '../styles/global.css';

export default function Register() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');

  const [accountType, setAccountType] = useState('company');
  const [inviteData, setInviteData] = useState(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    organizationName: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register, registerPlatformOwner, isLoading } = useApp();
  const navigate = useNavigate();

  // 🆕 Agar invite token hai toh details fetch karo
  useEffect(() => {
    if (inviteToken) {
      setInviteLoading(true);
      axios.get(`http://localhost:5000/api/invite/details/${inviteToken}`)
        .then(res => {
          setInviteData(res.data);
          setForm(prev => ({ ...prev, email: res.data.email }));
        })
        .catch(err => {
          setError(err.response?.data?.message || 'Invalid or expired invite');
        })
        .finally(() => setInviteLoading(false));
    }
  }, [inviteToken]);

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
      if (inviteToken) {
        // 🆕 Invite ke saath register
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          inviteToken: inviteToken
        });
        setSuccess('Account created! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else if (accountType === 'platform') {
        await registerPlatformOwner(form);
        setSuccess('Platform Owner account created! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        if (!form.organizationName) return setError('Organization name is required');
        await register(form);
        setSuccess('Account created! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const slug = form.organizationName.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');

  // ========== INVITE MODE (Agar invite token hai) ==========
  if (inviteToken) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: 520 }}>
          <h2>🎉 You're Invited!</h2>
          {inviteLoading ? (
            <p className="subtitle">Loading invite details...</p>
          ) : inviteData ? (
            <p className="subtitle">
              Join <strong>{inviteData.tenantName}</strong> as <strong>{inviteData.role}</strong>
            </p>
          ) : (
            <p className="subtitle">{error || 'Invalid invite'}</p>
          )}

          {error && !inviteData && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {inviteData && (
            <>
              {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>}
              {success && <div style={{ background: '#dcfce7', color: '#16a34a', padding: 12, borderRadius: 8, marginBottom: 16 }}>{success}</div>}

              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: 12, borderRadius: 8, marginBottom: 20, fontSize: '0.85rem', color: '#0369a1' }}>
                <div>🏢 <strong>{inviteData.tenantName}</strong></div>
                <div>👤 Role: <strong>{inviteData.role}</strong></div>
                <div>📧 Email: <strong>{inviteData.email}</strong></div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" required />
                </div>

                <div className="input-group">
                  <label>Email (locked)</label>
                  <input value={form.email} disabled style={{ background: '#f1f5f9', color: '#94a3b8' }} />
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
                    <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange} placeholder="Confirm password" required />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      {showConfirm ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required />
                    I agree to the Terms
                  </label>
                </div>

                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? '⏳ Creating Account...' : 'Join ' + inviteData.tenantName}
                </button>
              </form>
            </>
          )}

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--gray-500)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  // ========== NORMAL REGISTRATION (Bina invite) ==========
  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <h2>Create Your Account</h2>
        <p className="subtitle">Start your free trial. No credit card required.</p>

        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>}
        {success && <div style={{ background: '#dcfce7', color: '#16a34a', padding: 12, borderRadius: 8, marginBottom: 16 }}>{success}</div>}

        {/* Account Type Selector */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, padding: 4, background: '#f1f5f9', borderRadius: 10 }}>
          <button
            type="button"
            onClick={() => setAccountType('company')}
            style={{ flex: 1, padding: '10px 16px', background: accountType === 'company' ? 'white' : 'transparent', color: accountType === 'company' ? '#4f46e5' : '#64748b', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: accountType === 'company' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
          >
            🏢 Company Account
          </button>

        </div>

        {accountType === 'platform' && (
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: '0.8rem', color: '#92400e' }}>
            <strong>👑 Platform Owner Account</strong>
            <div style={{ marginTop: 4 }}></div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
          </div>

          {accountType === 'company' && (
            <div className="input-group">
              <label>Organization Name</label>
              <input name="organizationName" value={form.organizationName} onChange={handleChange} placeholder="Your Company Ltd" required={accountType === 'company'} />
              {form.organizationName && <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 4 }}>🔗 {slug}.yourapp.com</div>}
            </div>
          )}

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
              I agree to the Terms of Service
            </label>
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? '⏳ Creating Account...' : `Create ${accountType === 'platform' ? 'Platform Owner' : 'Company'} Account`}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--gray-500)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}