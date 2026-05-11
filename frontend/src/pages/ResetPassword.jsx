import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const { data } = await API.post(
        `/auth/reset-password/${token}`,
        { password }
      );

      toast.success(data.message);

      navigate('/login');

    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Reset failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>Reset Password</h1>

        <p style={s.subtitle}>
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} style={s.form}>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={s.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={s.button}
          >
            {loading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>
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
    background: '#DC2626',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 15,
  },
};