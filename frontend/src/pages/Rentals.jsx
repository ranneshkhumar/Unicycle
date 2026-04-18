import { useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Rentals() {
  const [tab, setTab] = useState('active');
  const [myRentals, setMyRentals] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [r, req, inc] = await Promise.all([
        API.get('/rentals/my-rentals'),
        API.get('/requests/my-requests'),
        API.get('/requests/incoming'),
      ]);
      setMyRentals(r.data.rentals);
      setMyRequests(req.data.requests);
      setIncomingRequests(inc.data.requests);
    } catch { toast.error('Failed to load rentals'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAccept = async (id) => {
    try { await API.put(`/requests/${id}/accept`); toast.success('Request accepted!'); fetchAll(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleReject = async (id) => {
    try { await API.put(`/requests/${id}/reject`); toast.success('Rejected'); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const handleReturn = async (id) => {
    try { await API.put(`/rentals/${id}/return`); toast.success('Marked as returned!'); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const active = myRentals.filter(r => r.status === 'active');
  const completed = myRentals.filter(r => r.status === 'completed');
  const pending = myRequests.filter(r => r.status === 'pending');
  const incoming = incomingRequests;

  const tabs = [
    { key: 'active', label: '🟢 Active', count: active.length },
    { key: 'pending', label: '⏳ Pending', count: pending.length },
    { key: 'incoming', label: '📬 Incoming', count: incoming.filter(r => r.status === 'pending').length },
    { key: 'completed', label: '✅ Completed', count: completed.length },
  ];

  const getStatusStyle = (status) => {
    const map = {
      active: { bg: '#DCFCE7', color: '#15803D', label: '● Active' },
      completed: { bg: '#F3F4F6', color: '#6B7280', label: '✓ Completed' },
      pending: { bg: '#FEF3C7', color: '#D97706', label: '◌ Pending' },
      accepted: { bg: '#DCFCE7', color: '#15803D', label: '✓ Accepted' },
      rejected: { bg: '#FEE2E2', color: '#DC2626', label: '✕ Rejected' },
    };
    return map[status] || { bg: '#F3F4F6', color: '#6B7280', label: status };
  };

  const RentalCard = ({ rental, type }) => {
    const st = getStatusStyle(rental.status);
    return (
      <div style={s.card}>
        <div style={s.cardImg}>
          {rental.item?.images?.[0]
            ? <img src={`http://localhost:5000${rental.item.images[0]}`} alt="" style={s.img} />
            : <div style={s.noImg}>📦</div>}
        </div>
        <div style={s.cardBody}>
          <div style={s.cardTop}>
            <h3 style={s.cardTitle}>{rental.item?.title}</h3>
            <span style={{ ...s.statusPill, background: st.bg, color: st.color }}>{st.label}</span>
          </div>
          <div style={s.cardMeta}>
            <span style={s.metaItem}>📅 {new Date(rental.startDate).toLocaleDateString()} — {new Date(rental.endDate).toLocaleDateString()}</span>
            <span style={s.metaItem}>💰 ₹{rental.totalAmount} · {rental.totalDays} days</span>
            <span style={s.metaItem}>👤 {type === 'renting' ? `Owner: ${rental.owner?.name}` : `Renter: ${rental.renter?.name}`}</span>
          </div>
        </div>
        {type === 'renting' && rental.status === 'active' && (
          <button style={s.returnBtn} onClick={() => handleReturn(rental._id)}>Mark Returned</button>
        )}
      </div>
    );
  };

  const RequestCard = ({ request, type }) => {
    const st = getStatusStyle(request.status);
    return (
      <div style={s.card}>
        <div style={s.cardImg}>
          {request.item?.images?.[0]
            ? <img src={`http://localhost:5000${request.item.images[0]}`} alt="" style={s.img} />
            : <div style={s.noImg}>📦</div>}
        </div>
        <div style={s.cardBody}>
          <div style={s.cardTop}>
            <h3 style={s.cardTitle}>{request.item?.title}</h3>
            <span style={{ ...s.statusPill, background: st.bg, color: st.color }}>{st.label}</span>
          </div>
          <div style={s.cardMeta}>
            <span style={s.metaItem}>📅 {new Date(request.startDate).toLocaleDateString()} — {new Date(request.endDate).toLocaleDateString()}</span>
            <span style={s.metaItem}>💰 ₹{request.totalAmount} · {request.totalDays} days</span>
            {type === 'incoming' && <span style={s.metaItem}>👤 From: {request.requester?.name}</span>}
            {request.message && <span style={s.metaItem}>💬 "{request.message}"</span>}
          </div>
        </div>
        {type === 'incoming' && request.status === 'pending' && (
          <div style={s.actionBtns}>
            <button style={s.acceptBtn} onClick={() => handleAccept(request._id)}>✓ Accept</button>
            <button style={s.rejectBtn} onClick={() => handleReject(request._id)}>✕ Reject</button>
          </div>
        )}
      </div>
    );
  };

  const Empty = ({ msg }) => (
    <div style={s.empty}>
      <div style={s.emptyEmoji}>📭</div>
      <p style={s.emptyText}>{msg}</p>
    </div>
  );

  const renderContent = () => {
    if (loading) return <div style={s.loading}>Loading...</div>;
    switch (tab) {
      case 'active': return active.length === 0 ? <Empty msg="No active rentals" /> : active.map(r => <RentalCard key={r._id} rental={r} type="renting" />);
      case 'pending': return pending.length === 0 ? <Empty msg="No pending requests" /> : pending.map(r => <RequestCard key={r._id} request={r} type="sent" />);
      case 'incoming': return incoming.length === 0 ? <Empty msg="No incoming requests" /> : incoming.map(r => <RequestCard key={r._id} request={r} type="incoming" />);
      case 'completed': return completed.length === 0 ? <Empty msg="No completed rentals" /> : completed.map(r => <RentalCard key={r._id} rental={r} type="renting" />);
      default: return null;
    }
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <h1 style={s.title}>My Rentals</h1>
          <p style={s.subtitle}>Track all your rental activity in one place</p>
        </div>

        <div style={s.tabs}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ ...s.tab, ...(tab === t.key ? s.tabActive : {}) }}>
              {t.label}
              {t.count > 0 && (
                <span style={{ ...s.tabCount, background: tab === t.key ? '#2E7D32' : '#E2EFE6', color: tab === t.key ? '#fff' : '#6B7280' }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={s.content}>{renderContent()}</div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#F1F8F4' },
  container: { maxWidth: 900, margin: '0 auto', padding: '36px 24px' },
  header: { marginBottom: 28 },
  title: { fontSize: 30, fontWeight: 800, color: '#1B1B1B', fontFamily: 'Poppins, sans-serif' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  tabs: { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  tab: { display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 8, border: '1.5px solid #E2EFE6', background: '#fff', color: '#6B7280', fontWeight: 500, cursor: 'pointer', fontSize: 14, transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  tabActive: { background: '#E8F5E9', border: '1.5px solid #A5D6A7', color: '#2E7D32', fontWeight: 600 },
  tabCount: { padding: '1px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 },
  content: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: '#fff', border: '1px solid #E2EFE6', borderRadius: 14, padding: 20, display: 'flex', gap: 16, alignItems: 'center', boxShadow: '0 2px 8px rgba(46,125,50,0.06)', transition: 'all 0.2s' },
  cardImg: { width: 80, height: 80, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#F1F8F4', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  noImg: { fontSize: 28 },
  cardBody: { flex: 1, minWidth: 0 },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#1B1B1B', fontFamily: 'Poppins, sans-serif' },
  statusPill: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, flexShrink: 0 },
  cardMeta: { display: 'flex', flexDirection: 'column', gap: 3 },
  metaItem: { fontSize: 13, color: '#6B7280' },
  actionBtns: { display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 },
  acceptBtn: { padding: '8px 16px', background: '#DCFCE7', border: '1px solid #A5D6A7', color: '#15803D', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 },
  rejectBtn: { padding: '8px 16px', background: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 },
  returnBtn: { padding: '10px 16px', background: '#E8F5E9', border: '1px solid #A5D6A7', color: '#2E7D32', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13, flexShrink: 0 },
  empty: { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 14, border: '1px solid #E2EFE6' },
  emptyEmoji: { fontSize: 44, marginBottom: 12 },
  emptyText: { color: '#6B7280', fontSize: 15 },
  loading: { textAlign: 'center', padding: 40, color: '#6B7280' },
};