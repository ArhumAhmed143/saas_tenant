import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../api';
import '../../styles/global.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setPreviewUrl('');
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setMessage(response.data.message || 'Reset link sent!');
      if (response.data.previewUrl) {
        setPreviewUrl(response.data.previewUrl);
      }
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🔑 Forgot Password</h2>
        <p className="subtitle">Enter your email to receive a password reset link.</p>

        {message && (
          <div style={{ background: '#dcfce7', color: '#16a34a', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            ✅ {message}
          </div>
        )}

        {/* 🆕 PREVIEW URL (Email dekhne ka button) */}
        {previewUrl && (
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            padding: 12,
            borderRadius: 8,
            marginBottom: 16
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0369a1', marginBottom: 8 }}>
              📧 Email Preview (click to open):
            </div>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '10px 14px',
                background: '#0ea5e9',
                color: 'white',
                textAlign: 'center',
                borderRadius: 6,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                marginBottom: 8,
              }}
            >
              🔗 Open Email Preview
            </a>
            <div style={{
              fontSize: '0.7rem',
              color: '#64748b',
              wordBreak: 'break-all',
              background: 'white',
              padding: 6,
              borderRadius: 4,
              border: '1px solid #e0f2fe'
            }}>
              {previewUrl}
            </div>
            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 8, marginBottom: 0 }}>
              💡 Yeh link new tab mein khulega jahan aap **poori email dekh sakte ho** (jaise real email).
            </p>
          </div>
        )}

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            ❌ {error}
          </div>
        )}

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

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '⏳ Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--gray-500)' }}>
          Remember your password? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}