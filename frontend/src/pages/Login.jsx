import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error('Please fill all fields');
    }

    try {
      setLoading(true);
      const { data } = await API.post('/auth/login', { email, password });

      localStorage.setItem('token', data.token);
      toast.success('Login successful');

      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <form style={s.card} onSubmit={handleSubmit}>
        <h2 style={s.title}>Welcome Back 👋</h2>
        <p style={s.subtitle}>Login to continue</p>

        <input
          type="email"
          placeholder="Email"
          style={s.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          style={s.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={s.btn} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p style={s.link}>
          Don’t have an account?{' '}
          <span style={s.linkText} onClick={() => navigate('/register')}>
            Register
          </span>
        </p>
      </form>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#F1F8F4',
    padding: 16
  },

  card: {
    width: '100%',
    maxWidth: 400,
    background: '#fff',
    padding: 24,
    borderRadius: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    boxShadow: '0 6px 24px rgba(0,0,0,0.08)'
  },

  title: {
    textAlign: 'center',
    fontSize: 'clamp(20px, 5vw, 24px)',
    fontWeight: 700,
    color: '#1B1B1B'
  },

  subtitle: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10
  },

  input: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    border: '1px solid #D1D5DB',
    fontSize: 14,
    outline: 'none'
  },

  btn: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    border: 'none',
    background: '#2E7D32',
    color: '#fff',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer'
  },

  link: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6B7280'
  },

  linkText: {
    color: '#2E7D32',
    fontWeight: 600,
    cursor: 'pointer'
  }
};