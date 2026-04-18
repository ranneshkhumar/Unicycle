import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import API from '../../utils/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await API.get('/notifications');
        setUnread(data.unreadCount);
      } catch {}
    };
    if (user) fetchUnread();
  }, [user, location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Browse' },
    { path: '/add-item', label: 'List Item' },
    { path: '/rentals', label: 'Rentals' },
    { path: '/messages', label: 'Messages' },
  ];

  return (
    <nav style={{ ...s.nav, ...(scrolled ? s.navScrolled : {}) }}>
      <div style={s.inner}>
        <Link to="/" style={s.logo}>
          <span style={s.logoText}>Unicycle</span>
        </Link>

        <div style={s.links}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{ ...s.link, ...(isActive(link.path) ? s.linkActive : {}) }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div style={s.actions}>
          {user?.role === 'admin' && (
            <Link to="/admin" style={s.adminChip}>⚙ Admin</Link>
          )}

          <Link to="/notifications" style={s.iconBtn}>
            🔔
            {unread > 0 && <span style={s.badge}>{unread}</span>}
          </Link>

          <Link to="/profile" style={s.profileBtn}>
            {user?.profileImage ? (
              <img
                src={`${
                  (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
                    .replace('/api', '')
                }${user.profileImage}`}
                style={s.avatar}
              />
            ) : (
              <div style={s.avatarFallback}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <span style={s.profileName}>
              {user?.name?.split(' ')[0]}
            </span>
          </Link>

          <button onClick={handleLogout} style={s.logoutBtn}>
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}

const s = {
  nav: { position: 'sticky', top: 0, zIndex: 100, background: '#2E7D32', padding: '0 24px', transition: 'all 0.3s', borderBottom: '1px solid rgba(0,0,0,0.08)' },
  navScrolled: { boxShadow: '0 4px 20px rgba(46,125,50,0.25)' },
  inner: { maxWidth: 1200, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', gap: 8 },
  logo: { display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: 24 },
  logoIcon: { width: 34, height: 34, background: 'rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 },
  logoText: { fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: 'Poppins, sans-serif' },
  links: { display: 'flex', alignItems: 'center', gap: 2, flex: 1 },
  link: { padding: '7px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.8)', textDecoration: 'none', transition: 'all 0.2s' },
  linkActive: { background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600 },
  actions: { display: 'flex', alignItems: 'center', gap: 8 },
  adminChip: { display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#FCD34D', textDecoration: 'none' },
  iconBtn: { position: 'relative', width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: 16, color: '#fff' },
  badge: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#DC2626', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #2E7D32' },
  profileBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px 4px 4px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 50, textDecoration: 'none', transition: 'all 0.2s' },
  avatar: { width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' },
  avatarFallback: { width: 28, height: 28, borderRadius: '50%', background: '#A5D6A7', color: '#1B5E20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 },
  profileName: { fontSize: 13, fontWeight: 600, color: '#fff' },
  logoutBtn: { padding: '7px 14px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, fontSize: 13, color: 'rgba(255,255,255,0.85)', cursor: 'pointer', transition: 'all 0.2s' },
};