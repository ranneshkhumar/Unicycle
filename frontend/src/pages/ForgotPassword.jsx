import { useState } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const { data } = await API.post('/auth/forgot-password', {
        email,
      });

      toast.success(data.message);

      setEmail('');

    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>Forgot Password</h1>

        <p style={s.subtitle}>
          Enter your college email to receive a password reset link.
        </p>

        <form onSubmit={handleSubmit} style={s.form}>
          <input
            type="email"
            placeholder="student@rajalakshmi.edu.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={s.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={s.button}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <Link to="/login" style={s.back}>
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#F5F7FB',
    padding: 20,
  },

  card: {
    width: '100%',
    maxWidth: 420,
    background: '#fff',
    borderRadius: 18,
    padding: 32,
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
  },

  title: {
    fontSize: 30,
    fontWeight: 700,
    marginBottom: 10,
    color: '#111827',
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 1.6,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },

  input: {
    padding: '14px 16px',
    borderRadius: 10,
    border: '1px solid #D1D5DB',
    fontSize: 14,
    outline: 'none',
  },

  button: {
    padding: '14px',
    border: 'none',
    borderRadius: 10,
    background: '#2563EB',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 15,
  },

  back: {
    display: 'inline-block',
    marginTop: 22,
    color: '#2563EB',
    textDecoration: 'none',
    fontWeight: 500,
  },
};
