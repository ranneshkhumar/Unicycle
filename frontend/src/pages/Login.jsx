// ONLY UI IMPROVED — LOGIC UNCHANGED

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // ✅ MOBILE DETECTION
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      
      {/* LEFT PANEL (HIDE ON MOBILE) */}
      {!isMobile && (
        <div style={s.leftPanel}>
          <div style={s.leftContent}>
            <h1 style={s.tagline}>Unicycle</h1>
            <h2 style={s.tagline}>Share more.<br />Spend less.</h2>

            <p style={s.taglineSub}>
              The campus marketplace for College students.
            </p>

            <div style={s.featureList}>
              {[
                { icon: '📚', text: 'Rent textbooks' },
                { icon: '💰', text: 'Save money' },
                { icon: '🌱', text: 'Reduce waste' },
                { icon: '🔒', text: 'Secure community' },
              ].map((f, i) => (
                <div key={i} style={s.feature}>
                  <span style={s.featureIcon}>{f.icon}</span>
                  <span style={s.featureText}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RIGHT PANEL */}
      <div style={{
        ...s.rightPanel,
        width: isMobile ? '100%' : 480,
        padding: isMobile ? 16 : 40
      }}>
        <div style={s.formCard}>

          <div style={s.formHeader}>
            <h2 style={s.formTitle}>Welcome</h2>
            <p style={s.formSub}>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            
            <div style={s.field}>
              <label style={s.label}>Email Address</label>
              <div style={{ ...s.inputWrap, ...(focused === 'email' ? s.inputFocused : {}) }}>
                <span style={s.inputIcon}>✉</span>
                <input
                  style={s.input}
                  type="email"
                  placeholder="Enter email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  required
                />
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Password</label>
              <div style={{ ...s.inputWrap, ...(focused === 'password' ? s.inputFocused : {}) }}>
                <span style={s.inputIcon}>🔑</span>
                <input
                  style={s.input}
                  type="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  required
                />
              </div>
            </div>

            <button
              style={{ ...s.btn, ...(loading ? s.btnLoading : {}) }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

          <div style={s.divider}>
            <span style={s.divLine} />
            <span style={s.divText}>Don't have an account?</span>
            <span style={s.divLine} />
          </div>

          <Link to="/register" style={s.registerBtn}>
            Create Account
          </Link>

        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'row',
    fontFamily: 'Inter, sans-serif'
  },

  leftPanel: {
    flex: 1,
    background: 'linear-gradient(160deg, #2E7D32, #1B5E20)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },

  leftContent: { maxWidth: 420 },

  tagline: {
    fontSize: 'clamp(26px, 5vw, 44px)',
    fontWeight: 800,
    color: '#fff',
    marginBottom: 16
  },

  taglineSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 30
  },

  featureList: { display: 'flex', flexDirection: 'column', gap: 10 },

  feature: { display: 'flex', gap: 10 },

  featureIcon: { fontSize: 18 },

  featureText: { color: '#fff', fontSize: 14 },

  rightPanel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F1F8F4'
  },

  formCard: {
    width: '100%',
    maxWidth: 420,
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 8px 40px rgba(0,0,0,0.1)'
  },

  formHeader: { marginBottom: 20 },

  formTitle: {
    fontSize: 22,
    fontWeight: 700
  },

  formSub: { fontSize: 13, color: '#6B7280' },

  form: { display: 'flex', flexDirection: 'column', gap: 16 },

  field: { display: 'flex', flexDirection: 'column', gap: 6 },

  label: { fontSize: 12 },

  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ccc',
    borderRadius: 8
  },

  inputFocused: {
    border: '1px solid #2E7D32'
  },

  inputIcon: { padding: 10 },

  input: {
    flex: 1,
    border: 'none',
    padding: 10,
    outline: 'none'
  },

  btn: {
    padding: 12,
    background: '#2E7D32',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer'
  },

  btnLoading: { opacity: 0.7 },

  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    margin: '20px 0'
  },

  divLine: { flex: 1, height: 1, background: '#ccc' },

  divText: { fontSize: 12 },

  registerBtn: {
    display: 'block',
    textAlign: 'center',
    padding: 10,
    border: '1px solid #2E7D32',
    borderRadius: 8,
    color: '#2E7D32'
  }
};