import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');
        const userId = params.get('userId');
        const name = params.get('name');
        const email = params.get('email');
        const role = params.get('role');
        const tenantId = params.get('tenantId');
        const errorParam = params.get('error');

        // Agar error parameter aaya hai (backend se)
        if (errorParam) {
            setError(errorParam);
            setTimeout(() => {
                navigate('/login?error=social_login_failed');
            }, 2000);
            return;
        }

        // Agar saare tokens aur user info mojood hain
        if (accessToken && refreshToken && userId) {
            try {
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify({
                    id: parseInt(userId),
                    name: decodeURIComponent(name || ''),
                    email: email || '',
                    role: role || 'Employee',
                    tenantId: parseInt(tenantId)
                }));
                
                // Success - dashboard par redirect
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            } catch (err) {
                setError('Failed to save user data');
                setTimeout(() => {
                    navigate('/login?error=save_failed');
                }, 2000);
            }
        } else {
            // Tokens missing - login par redirect
            setError('Missing authentication data');
            setTimeout(() => {
                navigate('/login?error=missing_tokens');
            }, 2000);
        }
    }, [location, navigate]);

    // Agar error hai toh error message dikhao
    if (error) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                background: '#f1f5f9'
            }}>
                <div style={{ textAlign: 'center', background: 'white', padding: 40, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: 16 }}>❌</span>
                    <h2 style={{ color: '#dc2626' }}>Authentication Failed</h2>
                    <p style={{ color: '#64748b' }}>{error}</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Redirecting to login...</p>
                </div>
            </div>
        );
    }

    // Loading state (Success case)
    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            background: '#f1f5f9'
        }}>
            <div style={{ textAlign: 'center', background: 'white', padding: 40, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    border: '4px solid #e2e8f0',
                    borderTop: '4px solid #4f46e5',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px auto'
                }}></div>
                <h2>🔐 Logging you in...</h2>
                <p style={{ color: '#64748b' }}>Please wait while we complete your authentication.</p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
}