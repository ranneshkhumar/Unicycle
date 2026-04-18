import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

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
      <div style={s.leftPanel}>
        <div style={s.leftContent}>
          <div style={s.logoBox}>
            
            
            <h1 style={s.tagline}>Unicycle<br /></h1>
          </div>
          <h2 style={s.tagline}>Share more.<br />Spend less.</h2>
          <p style={s.taglineSub}>
            The campus marketplace for College students. Rent, buy, sell, and share sustainably.
          </p>
          <div style={s.featureList}>
            {[
              { icon: '📚', text: 'Rent textbooks & lab equipment' },
              { icon: '💰', text: 'Save money by sharing resources' },
              { icon: '🌱', text: 'Reduce waste on campus' },
              { icon: '🔒', text: 'Secure college-only community' },
            ].map((f, i) => (
              <div key={i} style={s.feature}>
                <span style={s.featureIcon}>{f.icon}</span>
                <span style={s.featureText}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={s.rightPanel}>
        <div style={s.formCard}>
          <div style={s.formHeader}>
            <h2 style={s.formTitle}>Welcome </h2>
            <p style={s.formSub}>Sign in to your CampusShare account</p>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Email Address</label>
              <div style={{ ...s.inputWrap, ...(focused === 'email' ? s.inputFocused : {}) }}>
                <span style={s.inputIcon}>✉</span>
                <input
                  style={s.input}
                  type="email"
                  placeholder="use college email"
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
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  required
                />
              </div>
            </div>

            <button style={{ ...s.btn, ...(loading ? s.btnLoading : {}) }} type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={s.divider}>
            <span style={s.divLine} />
            <span style={s.divText}>Don't have an account?</span>
            <span style={s.divLine} />
          </div>

          <Link to="/register" style={s.registerBtn}>Create Account</Link>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' },
  leftPanel: { flex: 1, background: 'linear-gradient(160deg, #2E7D32 0%, #1B5E20 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', position: 'relative', overflow: 'hidden' },
  leftContent: { maxWidth: 420, position: 'relative', zIndex: 1 },
  logoBox: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 },
  logoIcon: { width: 44, height: 44, background: 'rgba(255,255,255,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 },
  logoText: { fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: 'Poppins, sans-serif' },
  tagline: { fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 16, fontFamily: 'Poppins, sans-serif' },
  taglineSub: { fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 36 },
  featureList: { display: 'flex', flexDirection: 'column', gap: 14 },
  feature: { display: 'flex', alignItems: 'center', gap: 12 },
  featureIcon: { width: 36, height: 36, background: 'rgba(255,255,255,0.12)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
  featureText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500 },
  rightPanel: { width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 40px', background: '#F1F8F4' },
  formCard: { width: '100%', background: '#fff', borderRadius: 20, padding: '40px 36px', boxShadow: '0 8px 40px rgba(46,125,50,0.12)' },
  formHeader: { marginBottom: 28 },
  formTitle: { fontSize: 26, fontWeight: 700, color: '#1B1B1B', marginBottom: 6, fontFamily: 'Poppins, sans-serif' },
  formSub: { fontSize: 14, color: '#6B7280' },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  inputWrap: { display: 'flex', alignItems: 'center', background: '#F9FBF9', border: '1.5px solid #E2EFE6', borderRadius: 10, overflow: 'hidden', transition: 'all 0.2s' },
  inputFocused: { border: '1.5px solid #66BB6A', boxShadow: '0 0 0 3px rgba(102,187,106,0.15)', background: '#fff' },
  inputIcon: { padding: '0 12px', fontSize: 15, color: '#9CA3AF', flexShrink: 0 },
  input: { flex: 1, padding: '13px 14px 13px 0', background: 'transparent', border: 'none', color: '#1B1B1B', fontSize: 14, width: '100%' },
  btn: { padding: '14px', background: 'linear-gradient(135deg, #2E7D32, #1B5E20)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4, boxShadow: '0 4px 16px rgba(46,125,50,0.3)', transition: 'all 0.2s', letterSpacing: 0.3 },
  btnLoading: { opacity: 0.7, cursor: 'not-allowed' },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' },
  divLine: { flex: 1, height: 1, background: '#E2EFE6' },
  divText: { fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap' },
  registerBtn: { display: 'block', textAlign: 'center', padding: '13px', background: '#F1F8F4', color: '#2E7D32', border: '1.5px solid #A5D6A7', borderRadius: 10, fontSize: 14, fontWeight: 600 },
};