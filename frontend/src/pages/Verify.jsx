import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';

export default function Verify() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyUser = async () => {
      try {
        await API.get(`/auth/verify/${token}`);
        setStatus('success');
        setMessage('Your email has been verified successfully!');

        // Auto redirect after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification link is invalid or expired');
      }
    };

    verifyUser();
  }, [token, navigate]);

  return (
    <div style={s.page}>
      <div style={s.card}>
        {status === 'verifying' && (
          <>
            <div style={s.spinnerContainer}>
              <div style={s.spinner} />
            </div>
            <h2 style={s.title}>Verifying your email</h2>
            <p style={s.subtitle}>Please wait while we confirm your account...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={s.successIcon}>🎉</div>
            <h2 style={s.title}>Email Verified!</h2>
            <p style={s.subtitle}>{message}</p>
            <p style={s.redirectText}>Redirecting you to login...</p>
            
            <button style={s.btn} onClick={() => navigate('/login')}>
              Go to Login →
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={s.errorIcon}>❌</div>
            <h2 style={s.title}>Verification Failed</h2>
            <p style={s.subtitle}>{message}</p>
            
            <div style={s.btnGroup}>
              <button style={s.btn} onClick={() => navigate('/login')}>
                Go to Login
              </button>
              <button style={s.secondaryBtn} onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ==================== STYLES ==================== */
const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f9f0 0%, #e6f3e6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Inter, sans-serif',
  },

  card: {
    background: '#fff',
    maxWidth: 420,
    width: '100%',
    borderRadius: 20,
    padding: '50px 30px',
    boxShadow: '0 15px 40px rgba(46, 125, 50, 0.15)',
    textAlign: 'center',
  },

  spinnerContainer: {
    marginBottom: 30,
  },

  spinner: {
    width: 56,
    height: 56,
    border: '6px solid #E8F5E9',
    borderTop: '6px solid #2E7D32',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
  },

  successIcon: {
    fontSize: 80,
    marginBottom: 20,
    animation: 'pop 0.6s ease',
  },

  errorIcon: {
    fontSize: 70,
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: 700,
    color: '#1B1B1B',
    marginBottom: 12,
    fontFamily: 'Poppins, sans-serif',
  },

  subtitle: {
    fontSize: 15.5,
    color: '#6B7280',
    lineHeight: 1.6,
    marginBottom: 24,
  },

  redirectText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },

  btn: {
    background: 'linear-gradient(135deg, #2E7D32, #1B5E20)',
    color: '#fff',
    border: 'none',
    padding: '14px 32px',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 10,
    width: '100%',
    transition: 'all 0.2s',
  },

  secondaryBtn: {
    background: '#F1F8F4',
    color: '#2E7D32',
    border: '1.5px solid #A5D6A7',
    padding: '14px 32px',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },

  btnGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginTop: 20,
  },
};

// Add keyframes for animation
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes pop {
    0% { transform: scale(0.5); opacity: 0; }
    60% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(styleSheet);