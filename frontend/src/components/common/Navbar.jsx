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
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

  // ✅ detect screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

        {/* LOGO */}
        <Link to="/" style={s.logo}>
          <span style={s.logoText}>Unicycle</span>
        </Link>

        {/* HAMBURGER (MOBILE ONLY) */}
        {isMobile && (
          <button style={s.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>
        )}

        {/* LINKS */}
        <div style={{
          ...s.links,
          ...(isMobile && {
            position: 'absolute',
            top: 64,
            left: 0,
            width: '100%',
            flexDirection: 'column',
            background: '#2E7D32',
            display: menuOpen ? 'flex' : 'none',
            padding: 10
          })
        }}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              style={{ ...s.link, ...(isActive(link.path) ? s.linkActive : {}) }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ACTIONS */}
        {!isMobile && (
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
                  src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${user.profileImage}`}
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
        )}

      </div>
    </nav>
  );
}

const s = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: '#2E7D32',
    padding: '0 16px',
    borderBottom: '1px solid rgba(0,0,0,0.08)'
  },
  navScrolled: { boxShadow: '0 4px 20px rgba(46,125,50,0.25)' },

  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  logo: { textDecoration: 'none' },
  logoText: { fontSize: 18, fontWeight: 700, color: '#fff' },

  menuBtn: {
    fontSize: 22,
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer'
  },

  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },

  link: {
    padding: '8px 14px',
    borderRadius: 8,
    fontSize: 14,
    color: '#fff',
    textDecoration: 'none'
  },

  linkActive: {
    background: 'rgba(255,255,255,0.2)'
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },

  iconBtn: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 8,
    background: 'rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff'
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: '#DC2626',
    color: '#fff',
    fontSize: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 50,
    background: 'rgba(255,255,255,0.1)'
  },

  avatar: { width: 28, height: 28, borderRadius: '50%' },

  avatarFallback: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: '#A5D6A7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  profileName: { color: '#fff', fontSize: 13 },

  logoutBtn: {
    padding: '6px 12px',
    borderRadius: 8,
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: 'none'
  },

  adminChip: {
    padding: '5px 10px',
    borderRadius: 20,
    background: '#F59E0B',
    color: '#fff',
    textDecoration: 'none'
  }
};