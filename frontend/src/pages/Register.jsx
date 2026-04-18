import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', university: 'Rajalakshmi Engineering College' });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.university);
      toast.success('Welcome to CampusShare!');
      navigate('/');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.leftPanel}>
        <div style={s.leftContent}>
          <div style={s.logoBox}>
            
            <span style={s.logoText}>Unicycle</span>
          </div>
          <h1 style={s.tagline}>Join the campus sharing community.</h1>
          <p style={s.taglineSub}>Connect with fellow students, save money and reduce waste by sharing resources on campus.</p>
          <div style={s.steps}>
            {['Create your free account', 'Browse campus listings', 'Rent, buy or share items', 'Connect with students'].map((step, i) => (
              <div key={i} style={s.step}>
                <div style={s.stepNum}>{i + 1}</div>
                <span style={s.stepText}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={s.rightPanel}>
        <div style={s.formCard}>
          <div style={s.formHeader}>
            <h2 style={s.formTitle}>Create Account</h2>
            <p style={s.formSub}>Join CampusShare — it's free!</p>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name', icon: '👤' },
              { key: 'email', label: 'College Email', type: 'email', placeholder: 'you@rajalakshmi.edu.in', icon: '✉', hint: '⚠️ Only @rajalakshmi.edu.in emails allowed' },
              { key: 'password', label: 'Password', type: 'password', placeholder: 'Minimum 6 characters', icon: '🔑' },
            ].map(f => (
              <div key={f.key} style={s.field}>
                <label style={s.label}>{f.label}</label>
                <div style={{ ...s.inputWrap, ...(focused === f.key ? s.inputFocused : {}) }}>
                  <span style={s.inputIcon}>{f.icon}</span>
                  <input
                    style={s.input}
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    onFocus={() => setFocused(f.key)}
                    onBlur={() => setFocused('')}
                    required
                  />
                </div>
                {f.hint && <p style={s.hint}>{f.hint}</p>}
              </div>
            ))}

            <div style={s.field}>
              <label style={s.label}>University</label>
              <div style={{ ...s.inputWrap, opacity: 0.65 }}>
                <span style={s.inputIcon}>🎓</span>
                <input style={s.input} value="Rajalakshmi Engineering College" readOnly />
              </div>
            </div>

            <button style={{ ...s.btn, ...(loading ? s.btnLoading : {}) }} type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div style={s.divider}>
            <span style={s.divLine} />
            <span style={s.divText}>Already have an account?</span>
            <span style={s.divLine} />
          </div>

          <Link to="/login" style={s.loginBtn}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' },
  leftPanel: { flex: 1, background: 'linear-gradient(160deg, #2E7D32 0%, #1B5E20 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' },
  leftContent: { maxWidth: 400 },
  logoBox: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 },
  logoIcon: { width: 44, height: 44, background: 'rgba(255,255,255,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 },
  logoText: { fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: 'Poppins, sans-serif' },
  tagline: { fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: 14, fontFamily: 'Poppins, sans-serif' },
  taglineSub: { fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 32 },
  steps: { display: 'flex', flexDirection: 'column', gap: 14 },
  step: { display: 'flex', alignItems: 'center', gap: 14 },
  stepNum: { width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 },
  stepText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500 },
  rightPanel: { width: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: '#F1F8F4', overflowY: 'auto' },
  formCard: { width: '100%', background: '#fff', borderRadius: 20, padding: '36px 32px', boxShadow: '0 8px 40px rgba(46,125,50,0.12)' },
  formHeader: { marginBottom: 24 },
  formTitle: { fontSize: 24, fontWeight: 700, color: '#1B1B1B', marginBottom: 4, fontFamily: 'Poppins, sans-serif' },
  formSub: { fontSize: 14, color: '#6B7280' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  inputWrap: { display: 'flex', alignItems: 'center', background: '#F9FBF9', border: '1.5px solid #E2EFE6', borderRadius: 10, overflow: 'hidden', transition: 'all 0.2s' },
  inputFocused: { border: '1.5px solid #66BB6A', boxShadow: '0 0 0 3px rgba(102,187,106,0.15)', background: '#fff' },
  inputIcon: { padding: '0 12px', fontSize: 14, color: '#9CA3AF', flexShrink: 0 },
  input: { flex: 1, padding: '12px 12px 12px 0', background: 'transparent', border: 'none', color: '#1B1B1B', fontSize: 14, width: '100%' },
  hint: { fontSize: 11, color: '#F59E0B', marginTop: 2 },
  btn: { padding: '13px', background: 'linear-gradient(135deg, #2E7D32, #1B5E20)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 2, boxShadow: '0 4px 16px rgba(46,125,50,0.3)', transition: 'all 0.2s' },
  btnLoading: { opacity: 0.7, cursor: 'not-allowed' },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' },
  divLine: { flex: 1, height: 1, background: '#E2EFE6' },
  divText: { fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap' },
  loginBtn: { display: 'block', textAlign: 'center', padding: '12px', background: '#F1F8F4', color: '#2E7D32', border: '1.5px solid #A5D6A7', borderRadius: 10, fontSize: 14, fontWeight: 600 },
};