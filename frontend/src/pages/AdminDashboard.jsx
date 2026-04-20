import { useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [d, u, i] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/admin/users'),
        API.get('/admin/items')
      ]);
      setStats(d.data.stats);
      setUsers(u.data.users);
      setItems(i.data.items);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (id) => {
    if (!window.confirm('Remove this item?')) return;
    try {
      await API.delete(`/admin/items/${id}`);
      toast.success('Removed');
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const handleToggleUser = async (id) => {
    try {
      await API.put(`/admin/users/${id}/toggle`);
      toast.success('Updated');
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const tabs = [
    { key: 'dashboard', label: '📊 Dashboard' },
    { key: 'users', label: '👥 Members' },
    { key: 'items', label: '📦 Listings' },
    { key: 'activity', label: '📈 Activity' },
  ];

  const statCards = [
    { label: 'Total Members', value: stats.totalUsers ?? 0, icon: '👥', bg: '#E8F5E9', color: '#2E7D32', border: '#A5D6A7' },
    { label: 'Total Listings', value: stats.totalItems ?? 0, icon: '📦', bg: '#E0F2FE', color: '#0284C7', border: '#BAE6FD' },
    { label: 'Total Rentals', value: stats.totalRentals ?? 0, icon: '🔄', bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
    { label: 'Active Rentals', value: stats.activeRentals ?? 0, icon: '🟢', bg: '#DCFCE7', color: '#15803D', border: '#86EFAC' },
  ];

  const getTypePill = (type) => {
    if (type === 'Free') return { bg: '#DCFCE7', color: '#15803D' };
    if (type === 'Sell') return { bg: '#FEF3C7', color: '#D97706' };
    return { bg: '#E8F5E9', color: '#2E7D32' };
  };

  return (
    <div style={s.page}>
      <div style={s.container(isMobile)}>
        <div style={s.header(isMobile)}>
          <div>
            <h1 style={s.title}>Admin Dashboard</h1>
            <p style={s.subtitle}>Manage and monitor Unicycle platform</p>
          </div>
          <button style={s.refreshBtn} onClick={fetchAll}>↺ Refresh</button>
        </div>

        <div style={s.tabs(isMobile)}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{ ...s.tab, ...(tab === t.key ? s.tabActive : {}) }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={s.loading}>Loading data...</div>
        ) : (
          <>
            {tab === 'dashboard' && (
              <div>
                <div style={s.statsGrid(isMobile)}>
                  {statCards.map(c => (
                    <div key={c.label} style={{ ...s.statCard, background: c.bg, border: `1px solid ${c.border}` }}>
                      <div style={s.statTop}>
                        <span style={s.statIcon}>{c.icon}</span>
                        <span style={{ ...s.statValue, color: c.color }}>{c.value}</span>
                      </div>
                      <p style={{ ...s.statLabel, color: c.color }}>{c.label}</p>
                    </div>
                  ))}
                </div>

                <div style={s.twoCol(isMobile)}>
                  <div style={s.panel}>
                    <p style={s.panelTitle}>Recent Members</p>
                    {users.slice(0, 5).map(u => (
                      <div key={u._id} style={s.listRow}>
                        <div style={s.listAvatar}>{u.name?.charAt(0)}</div>
                        <div style={s.listInfo}>
                          <p style={s.listName}>{u.name}</p>
                          <p style={s.listSub}>{u.email}</p>
                        </div>
                        <span style={{ ...s.pill, background: u.role === 'admin' ? '#FEF3C7' : '#E8F5E9', color: u.role === 'admin' ? '#D97706' : '#2E7D32' }}>
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={s.panel}>
                    <p style={s.panelTitle}>Recent Listings</p>
                    {items.slice(0, 5).map(item => (
                      <div key={item._id} style={s.listRow}>
                        <div style={s.listThumb}>
                          {item.images?.[0]
                            ? <img src={`http://localhost:5000${item.images[0]}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span>📦</span>}
                        </div>
                        <div style={s.listInfo}>
                          <p style={s.listName}>{item.title}</p>
                          <p style={s.listSub}>{item.owner?.name} · {item.category}</p>
                        </div>
                        <span style={{ ...s.pill, ...getTypePill(item.listingType) }}>{item.listingType}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={s.summaryBox}>
                  <p style={s.panelTitle}>Platform Summary</p>
                  <div style={s.summaryGrid(isMobile)}>
                    {[
                      { label: 'Active Members', value: users.filter(u => u.isActive).length },
                      { label: 'Admins', value: users.filter(u => u.role === 'admin').length },
                      { label: 'For Rent', value: items.filter(i => i.listingType === 'Rent').length },
                      { label: 'For Sale', value: items.filter(i => i.listingType === 'Sell').length },
                      { label: 'Free Items', value: items.filter(i => i.listingType === 'Free').length },
                      { label: 'Available Now', value: items.filter(i => i.isAvailable).length },
                    ].map(item => (
                      <div key={item.label} style={s.summaryItem}>
                        <p style={s.summaryVal}>{item.value}</p>
                        <p style={s.summaryLabel}>{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'users' && (
              <div style={s.tableCard}>
                <p style={s.panelTitle}>All Members ({users.length})</p>
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <thead>
                      <tr style={s.thead}>
                        {['Member', 'Email', 'University', 'Role', 'Status', 'Joined', 'Action'].map(h => (
                          <th key={h} style={s.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} style={s.tr}>
                          <td style={s.td}>
                            <div style={s.userCell}>
                              <div style={s.tableAvatar}>{u.name?.charAt(0)}</div>
                              <span style={s.tdBold}>{u.name}</span>
                            </div>
                          </td>
                          <td style={s.td}><span style={s.tdText}>{u.email}</span></td>
                          <td style={s.td}><span style={s.tdText}>{u.university || '—'}</span></td>
                          <td style={s.td}>
                            <span style={{ ...s.pill, background: u.role === 'admin' ? '#FEF3C7' : '#E8F5E9', color: u.role === 'admin' ? '#D97706' : '#2E7D32' }}>{u.role}</span>
                          </td>
                          <td style={s.td}>
                            <span style={{ color: u.isActive ? '#15803D' : '#DC2626', fontWeight: 600, fontSize: 13 }}>
                              {u.isActive ? '● Active' : '● Inactive'}
                            </span>
                          </td>
                          <td style={s.td}><span style={s.tdText}>{new Date(u.createdAt).toLocaleDateString()}</span></td>
                          <td style={s.td}>
                            <button
                              style={{ ...s.actionBtn, background: u.isActive ? '#FEE2E2' : '#DCFCE7', color: u.isActive ? '#DC2626' : '#15803D', border: `1px solid ${u.isActive ? '#FECACA' : '#A5D6A7'}` }}
                              onClick={() => handleToggleUser(u._id)}>
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'items' && (
              <div style={s.tableCard}>
                <p style={s.panelTitle}>All Listings ({items.length})</p>
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <thead>
                      <tr style={s.thead}>
                        {['Item', 'Category', 'Type', 'Price', 'Owner', 'Status', 'Action'].map(h => (
                          <th key={h} style={s.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item._id} style={s.tr}>
                          <td style={s.td}>
                            <div style={s.userCell}>
                              <div style={s.listThumb}>
                                {item.images?.[0]
                                  ? <img src={`http://localhost:5000${item.images[0]}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  : <span style={{ fontSize: 16 }}>📦</span>}
                              </div>
                              <span style={s.tdBold}>{item.title}</span>
                            </div>
                          </td>
                          <td style={s.td}><span style={s.tdText}>{item.category}</span></td>
                          <td style={s.td}>
                            <span style={{ ...s.pill, ...getTypePill(item.listingType) }}>{item.listingType}</span>
                          </td>
                          <td style={s.td}><span style={s.tdText}>{item.listingType === 'Free' ? '—' : item.listingType === 'Sell' ? `₹${item.sellingPrice}` : `₹${item.pricePerDay}/day`}</span></td>
                          <td style={s.td}><span style={s.tdText}>{item.owner?.name}</span></td>
                          <td style={s.td}>
                            <span style={{ color: item.isAvailable ? '#15803D' : '#D97706', fontWeight: 600, fontSize: 13 }}>
                              {item.isAvailable ? '● Available' : '● Rented'}
                            </span>
                          </td>
                          <td style={s.td}>
                            <button style={{ ...s.actionBtn, background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}
                              onClick={() => handleRemoveItem(item._id)}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'activity' && (
              <div style={s.twoCol(isMobile)}>
                <div style={s.panel}>
                  <p style={s.panelTitle}>Platform Statistics</p>
                  {[
                    { label: 'Total Members', value: stats.totalUsers ?? 0, icon: '👥' },
                    { label: 'Active Members', value: users.filter(u => u.isActive).length, icon: '🟢' },
                    { label: 'Inactive Members', value: users.filter(u => !u.isActive).length, icon: '🔴' },
                    { label: 'Total Listings', value: stats.totalItems ?? 0, icon: '📦' },
                    { label: 'For Rent', value: items.filter(i => i.listingType === 'Rent').length, icon: '🔄' },
                    { label: 'For Sale', value: items.filter(i => i.listingType === 'Sell').length, icon: '💰' },
                    { label: 'Free Items', value: items.filter(i => i.listingType === 'Free').length, icon: '🎁' },
                    { label: 'Total Rentals', value: stats.totalRentals ?? 0, icon: '📋' },
                    { label: 'Active Rentals', value: stats.activeRentals ?? 0, icon: '🔥' },
                  ].map(item => (
                    <div key={item.label} style={s.actRow}>
                      <span style={s.actIcon}>{item.icon}</span>
                      <span style={s.actLabel}>{item.label}</span>
                      <span style={s.actValue}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div style={s.panel}>
                  <p style={s.panelTitle}>Category Breakdown</p>
                  {['Books', 'Electronics', 'Lab Equipment', 'Clothing', 'Other'].map(cat => {
                    const count = items.filter(i => i.category === cat).length;
                    const pct = items.length > 0 ? Math.round((count / items.length) * 100) : 0;
                    return (
                      <div key={cat} style={s.catRow}>
                        <div style={s.catTop}>
                          <span style={s.actLabel}>{cat}</span>
                          <span style={{ ...s.actValue, fontSize: 14 }}>{count} ({pct}%)</span>
                        </div>
                        <div style={s.barBg}>
                          <div style={{ ...s.barFill, width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ==================== RESPONSIVE STYLES ==================== */
const s = {
  page: { minHeight: '100vh', background: '#F1F8F4' },

  container: (isMobile) => ({
    maxWidth: 1200,
    margin: '0 auto',
    padding: isMobile ? '24px 16px' : '36px 24px'
  }),

  header: (isMobile) => ({
    display: 'flex',
    justifyContent: isMobile ? 'flex-start' : 'space-between',
    alignItems: 'flex-start',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? 16 : 0,
    marginBottom: 28
  }),

  title: { fontSize: 30, fontWeight: 800, color: '#1B1B1B', fontFamily: 'Poppins, sans-serif' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  refreshBtn: { padding: '9px 18px', background: '#fff', border: '1.5px solid #A5D6A7', borderRadius: 8, color: '#2E7D32', fontWeight: 600, cursor: 'pointer', fontSize: 14, boxShadow: '0 1px 4px rgba(46,125,50,0.08)' },

  tabs: (isMobile) => ({
    display: 'flex',
    gap: 8,
    marginBottom: 24,
    overflowX: isMobile ? 'auto' : 'visible',
    paddingBottom: isMobile ? 8 : 0,
    scrollbarWidth: 'none',
  }),

  tab: { 
    padding: '10px 20px', 
    borderRadius: 8, 
    border: '1.5px solid #E2EFE6', 
    background: '#fff', 
    color: '#6B7280', 
    fontWeight: 500, 
    cursor: 'pointer', 
    fontSize: 14, 
    transition: 'all 0.2s', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    whiteSpace: 'nowrap'
  },
  tabActive: { background: '#E8F5E9', border: '1.5px solid #A5D6A7', color: '#2E7D32', fontWeight: 600 },

  statsGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 24
  }),

  statCard: { borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 8px rgba(46,125,50,0.06)' },
  statTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statIcon: { fontSize: 28 },
  statValue: { fontSize: 40, fontWeight: 800, fontFamily: 'Poppins, sans-serif' },
  statLabel: { fontSize: 13, fontWeight: 600 },

  twoCol: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: 20,
    marginBottom: 20
  }),

  panel: { background: '#fff', border: '1px solid #E2EFE6', borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 8px rgba(46,125,50,0.06)' },
  panelTitle: { fontSize: 13, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 },

  listRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F1F8F4' },
  listAvatar: { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #2E7D32, #66BB6A)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 },
  listThumb: { width: 36, height: 36, borderRadius: 8, background: '#F1F8F4', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '1px solid #E2EFE6' },
  listInfo: { flex: 1, minWidth: 0 },
  listName: { fontSize: 13, fontWeight: 600, color: '#1B1B1B', marginBottom: 2 },
  listSub: { fontSize: 11, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  pill: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0 },

  summaryBox: { background: '#fff', border: '1px solid #E2EFE6', borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 8px rgba(46,125,50,0.06)' },
  summaryGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(6, 1fr)',
    gap: 12
  }),
  summaryItem: { textAlign: 'center', padding: '16px 8px', background: '#F1F8F4', borderRadius: 10, border: '1px solid #E2EFE6' },
  summaryVal: { fontSize: 28, fontWeight: 800, color: '#2E7D32', fontFamily: 'Poppins, sans-serif' },
  summaryLabel: { fontSize: 11, color: '#6B7280', marginTop: 4 },

  tableCard: { background: '#fff', border: '1px solid #E2EFE6', borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 8px rgba(46,125,50,0.06)' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 800 },
  thead: { background: '#F9FBF9' },
  th: { padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: '1.5px solid #E2EFE6' },
  tr: { borderBottom: '1px solid #F1F8F4', transition: 'background 0.15s' },
  td: { padding: '12px 14px', verticalAlign: 'middle' },
  tdText: { fontSize: 13, color: '#6B7280' },
  tdBold: { fontSize: 13, fontWeight: 600, color: '#1B1B1B' },
  userCell: { display: 'flex', alignItems: 'center', gap: 10 },
  tableAvatar: { width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #2E7D32, #66BB6A)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 },
  actionBtn: { padding: '6px 14px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' },

  actRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F1F8F4' },
  actIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  actLabel: { flex: 1, fontSize: 13, color: '#374151' },
  actValue: { fontSize: 20, fontWeight: 700, color: '#2E7D32', fontFamily: 'Poppins, sans-serif' },

  catRow: { padding: '10px 0', borderBottom: '1px solid #F1F8F4' },
  catTop: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  barBg: { height: 6, background: '#E2EFE6', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', background: 'linear-gradient(90deg, #2E7D32, #66BB6A)', borderRadius: 3, transition: 'width 0.5s' },

  loading: { textAlign: 'center', padding: 60, color: '#6B7280', fontSize: 15 },
};