import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const ItemDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [form, setForm] = useState({ startDate: '', endDate: '', message: '' });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // ✅ BASE URL FIX
  const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const [itemRes, reviewRes] = await Promise.all([
          API.get(`/items/${id}`),
          API.get(`/reviews/item/${id}`),
        ]);
        setItem(itemRes.data.item);
        setReviews(reviewRes.data.reviews);
      } catch {
        toast.error('Item not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const totalDays = form.startDate && form.endDate
    ? Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24))
    : 0;

  const handleRequest = async (e) => {
    e.preventDefault();
    if (totalDays <= 0) return toast.error('Invalid date range');
    setRequesting(true);
    try {
      await API.post('/requests', {
        itemId: id,
        startDate: form.startDate,
        endDate: form.endDate,
        message: form.message,
      });
      toast.success('Rental request sent!');
      navigate('/rentals');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <div style={s.center}>Loading...</div>;
  if (!item) return null;

  const isOwner = user?._id === item.owner?._id;

  const getPriceDisplay = () => {
    if (item.listingType === 'Free') return '🎁 Free';
    if (item.listingType === 'Sell') return `₹${item.sellingPrice}`;
    return `₹${item.pricePerDay} per day`;
  };

  const getListingBadge = () => {
    if (item.listingType === 'Free') return { bg: '#d1fae5', color: '#065f46', label: '🎁 Free' };
    if (item.listingType === 'Sell') return { bg: '#fef3c7', color: '#92400e', label: '💰 For Sale' };
    return { bg: '#eef2ff', color: '#4f46e5', label: '🔄 For Rent' };
  };

  const badge = getListingBadge();

  return (
    <div style={s.page}>
      <div style={s.container(isMobile)}>
        <button style={s.backBtn} onClick={() => navigate('/')}>← Back</button>

        <div style={s.grid(isMobile)}>

          {/* Left - Images + Details */}
          <div>
            <div style={s.imgBox}>
              {item.images?.[0]
                ? <img src={`${BASE_URL}${item.images[0]}`} alt={item.title} style={s.mainImg} />
                : <div style={s.noImg}>📦</div>}
            </div>

            {item.images?.length > 1 && (
              <div style={s.thumbs}>
                {item.images.map((img, i) => (
                  <img key={i} src={`${BASE_URL}${img}`} alt="" style={s.thumb} />
                ))}
              </div>
            )}

            <div style={s.infoCard}>
              <div style={s.metaRow}>
                <span style={{ ...s.badge, background: badge.bg, color: badge.color }}>
                  {badge.label}
                </span>
                <span style={s.categoryBadge}>{item.category}</span>
                <span style={s.conditionBadge}>{item.condition}</span>
              </div>

              <h1 style={s.title}>{item.title}</h1>
              <p style={s.price}>{getPriceDisplay()}</p>
              <p style={s.description}>{item.description}</p>

              {item.tags?.length > 0 && (
                <div style={s.tagsRow}>
                  {item.tags.map((tag, i) => (
                    <span key={i} style={s.tag}>#{tag}</span>
                  ))}
                </div>
              )}

              <div style={s.ownerCard}>
                <div style={s.ownerAvatar}>{item.owner?.name?.charAt(0)}</div>
                <div>
                  <p style={s.ownerName}>{item.owner?.name}</p>
                  <p style={s.ownerUni}>🎓 {item.owner?.university || 'Student'}</p>
                  <p style={s.ownerRating}>⭐ {item.owner?.rating || 0} rating</p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div style={s.reviewsSection}>
                <h3 style={s.reviewsTitle}>⭐ Reviews ({reviews.length})</h3>
                {reviews.map(r => (
                  <div key={r._id} style={s.review}>
                    <div style={s.reviewHeader}>
                      <div style={s.reviewAvatar}>{r.reviewer?.name?.charAt(0)}</div>
                      <div>
                        <p style={s.reviewerName}>{r.reviewer?.name}</p>
                        <p style={s.reviewStars}>{'⭐'.repeat(r.rating)}</p>
                      </div>
                    </div>
                    {r.comment && <p style={s.reviewComment}>{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right - Actions */}
          <div style={s.actionWrapper(isMobile)}>
            {isOwner ? (
              <div style={s.ownerNote}>✅ This is your listing</div>
            ) : (
              <div style={s.actionCard(isMobile)}>

                <Link to={`/messages/${item.owner?._id}`} style={s.msgBtn}>
                  💬 Message Owner
                </Link>

                {item.listingType === 'Rent' && item.isAvailable && (
                  <form onSubmit={handleRequest}>
                    <h3 style={s.requestTitle}>📅 Request to Rent</h3>

                    <div style={s.field}>
                      <label style={s.label}>Start Date</label>
                      <input
                        style={s.input}
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={form.startDate}
                        onChange={e => setForm({ ...form, startDate: e.target.value })}
                        required
                      />
                    </div>

                    <div style={s.field}>
                      <label style={s.label}>End Date</label>
                      <input
                        style={s.input}
                        type="date"
                        min={form.startDate}
                        value={form.endDate}
                        onChange={e => setForm({ ...form, endDate: e.target.value })}
                        required
                      />
                    </div>

                    {totalDays > 0 && (
                      <div style={s.summary}>
                        <p>📅 {totalDays} days</p>
                        <p style={s.totalAmount}>Total: ₹{totalDays * item.pricePerDay}</p>
                      </div>
                    )}

                    <div style={s.field}>
                      <label style={s.label}>Message (optional)</label>
                      <textarea
                        style={{ ...s.input, height: 80 }}
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                      />
                    </div>

                    <button style={s.requestBtn} type="submit" disabled={requesting}>
                      {requesting ? 'Sending...' : '🚀 Send Request'}
                    </button>
                  </form>
                )}

                {item.listingType === 'Sell' && (
                  <div style={s.sellBox}>
                    <h3 style={s.requestTitle}>💰 Buy This Item</h3>
                    <p style={s.sellPrice}>₹{item.sellingPrice}</p>
                  </div>
                )}

                {item.listingType === 'Free' && (
                  <div style={s.freeBox}>
                    <h3 style={s.requestTitle}>🎁 Get This for Free</h3>
                  </div>
                )}

                {item.listingType === 'Rent' && !item.isAvailable && (
                  <div style={s.unavailableNote}>❌ Currently rented out</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==================== RESPONSIVE STYLES ==================== */
const s = {
  page: { minHeight: '100vh', background: '#f0f4f8', padding: '20px 16px' },

  container: (isMobile) => ({
    maxWidth: 1100,
    margin: '0 auto'
  }),

  backBtn: { background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginBottom: 16 },

  grid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 380px',
    gap: isMobile ? 24 : 28
  }),

  imgBox: { borderRadius: 16, overflow: 'hidden', height: 340, marginBottom: 12 },
  mainImg: { width: '100%', height: '100%', objectFit: 'cover' },
  noImg: { width: '100%', height: '100%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 },

  thumbs: { display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 8 },
  thumb: { width: 70, height: 70, borderRadius: 8, objectFit: 'cover', border: '2px solid #e5e7eb', flexShrink: 0 },

  infoCard: { background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  metaRow: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' },
  badge: { padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700 },
  categoryBadge: { background: '#eef2ff', color: '#4f46e5', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
  conditionBadge: { background: '#f0fdf4', color: '#16a34a', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 },

  title: { fontSize: 24, fontWeight: 800, color: '#1a202c', marginBottom: 12 },
  price: { fontSize: 28, fontWeight: 800, color: '#4f46e5', marginBottom: 16 },
  description: { color: '#374151', lineHeight: 1.6, marginBottom: 16 },
  tagsRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  tag: { background: '#f3f4f6', color: '#6b7280', padding: '4px 10px', borderRadius: 20, fontSize: 12 },

  ownerCard: { display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#f9fafb', borderRadius: 12 },
  ownerAvatar: { width: 44, height: 44, borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 },
  ownerName: { fontWeight: 700, color: '#1a202c' },
  ownerUni: { fontSize: 13, color: '#6b7280' },
  ownerRating: { fontSize: 13, color: '#f59e0b' },

  reviewsSection: { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  reviewsTitle: { fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#1a202c' },
  review: { borderBottom: '1px solid #f3f4f6', paddingBottom: 12, marginBottom: 12 },
  reviewHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 },
  reviewAvatar: { width: 32, height: 32, borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
  reviewerName: { fontWeight: 600, fontSize: 14, color: '#1a202c' },
  reviewStars: { fontSize: 12 },
  reviewComment: { color: '#374151', fontSize: 14 },

  actionWrapper: (isMobile) => ({
    position: isMobile ? 'static' : 'sticky',
    top: 80
  }),

  actionCard: (isMobile) => ({
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    position: isMobile ? 'static' : 'sticky',
    top: 80
  }),

  msgBtn: { 
    display: 'block', 
    textAlign: 'center', 
    padding: '14px', 
    background: '#f3f4f6', 
    color: '#374151', 
    borderRadius: 10, 
    fontWeight: 600, 
    fontSize: 15, 
    textDecoration: 'none', 
    marginBottom: 20 
  },

  requestTitle: { fontSize: 18, fontWeight: 700, color: '#1a202c', marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151', fontSize: 14 },
  input: { width: '100%', padding: '12px 14px', border: '2px solid #e5e7eb', borderRadius: 10, fontSize: 14, boxSizing: 'border-box' },

  summary: { background: '#eef2ff', borderRadius: 10, padding: 14, marginBottom: 16, color: '#4f46e5' },
  totalAmount: { fontSize: 20, fontWeight: 800, marginTop: 4 },

  requestBtn: { 
    width: '100%', 
    padding: 14, 
    background: '#4f46e5', 
    color: '#fff', 
    border: 'none', 
    borderRadius: 10, 
    fontSize: 16, 
    fontWeight: 700, 
    cursor: 'pointer' 
  },

  sellBox: { background: '#fef3c7', borderRadius: 12, padding: 20, marginTop: 16 },
  sellPrice: { fontSize: 32, fontWeight: 800, color: '#92400e', marginBottom: 8 },

  freeBox: { background: '#d1fae5', borderRadius: 12, padding: 20, marginTop: 16 },

  ownerNote: { background: '#d1fae5', color: '#065f46', padding: 20, borderRadius: 16, textAlign: 'center', fontWeight: 600 },
  unavailableNote: { background: '#fee2e2', color: '#991b1b', padding: 20, borderRadius: 16, textAlign: 'center', fontWeight: 600, marginTop: 16 },

  center: { textAlign: 'center', padding: 60 },
};

export default ItemDetail;