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

  // ✅ BASE URL FIX
  const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

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

  if (loading) return <div style={styles.center}>Loading...</div>;
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
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Back</button>
        <div style={styles.grid}>

          {/* Left */}
          <div>
            <div style={styles.imgBox}>
              {item.images?.[0]
                ? <img src={`${BASE_URL}${item.images[0]}`} alt={item.title} style={styles.mainImg} />
                : <div style={styles.noImg}>📦</div>}
            </div>

            {item.images?.length > 1 && (
              <div style={styles.thumbs}>
                {item.images.map((img, i) => (
                  <img key={i} src={`${BASE_URL}${img}`} alt="" style={styles.thumb} />
                ))}
              </div>
            )}

            <div style={styles.infoCard}>
              <div style={styles.metaRow}>
                <span style={{ ...styles.badge, background: badge.bg, color: badge.color }}>
                  {badge.label}
                </span>
                <span style={styles.categoryBadge}>{item.category}</span>
                <span style={styles.conditionBadge}>{item.condition}</span>
              </div>

              <h1 style={styles.title}>{item.title}</h1>
              <p style={styles.price}>{getPriceDisplay()}</p>
              <p style={styles.description}>{item.description}</p>

              {item.tags?.length > 0 && (
                <div style={styles.tagsRow}>
                  {item.tags.map((tag, i) => (
                    <span key={i} style={styles.tag}>#{tag}</span>
                  ))}
                </div>
              )}

              <div style={styles.ownerCard}>
                <div style={styles.ownerAvatar}>{item.owner?.name?.charAt(0)}</div>
                <div>
                  <p style={styles.ownerName}>{item.owner?.name}</p>
                  <p style={styles.ownerUni}>🎓 {item.owner?.university || 'Student'}</p>
                  <p style={styles.ownerRating}>⭐ {item.owner?.rating || 0} rating</p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div style={styles.reviewsSection}>
                <h3 style={styles.reviewsTitle}>⭐ Reviews ({reviews.length})</h3>
                {reviews.map(r => (
                  <div key={r._id} style={styles.review}>
                    <div style={styles.reviewHeader}>
                      <div style={styles.reviewAvatar}>{r.reviewer?.name?.charAt(0)}</div>
                      <div>
                        <p style={styles.reviewerName}>{r.reviewer?.name}</p>
                        <p style={styles.reviewStars}>{'⭐'.repeat(r.rating)}</p>
                      </div>
                    </div>
                    {r.comment && <p style={styles.reviewComment}>{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right */}
          <div>
            {isOwner ? (
              <div style={styles.ownerNote}>✅ This is your listing</div>
            ) : (
              <div style={styles.actionCard}>

                <Link to={`/messages/${item.owner?._id}`} style={styles.msgBtn}>
                  💬 Message Owner
                </Link>

                {item.listingType === 'Rent' && item.isAvailable && (
                  <form onSubmit={handleRequest}>
                    <h3 style={styles.requestTitle}>📅 Request to Rent</h3>

                    <div style={styles.field}>
                      <label style={styles.label}>Start Date</label>
                      <input
                        style={styles.input}
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={form.startDate}
                        onChange={e => setForm({ ...form, startDate: e.target.value })}
                        required
                      />
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>End Date</label>
                      <input
                        style={styles.input}
                        type="date"
                        min={form.startDate}
                        value={form.endDate}
                        onChange={e => setForm({ ...form, endDate: e.target.value })}
                        required
                      />
                    </div>

                    {totalDays > 0 && (
                      <div style={styles.summary}>
                        <p>📅 {totalDays} days</p>
                        <p style={styles.totalAmount}>Total: ₹{totalDays * item.pricePerDay}</p>
                      </div>
                    )}

                    <div style={styles.field}>
                      <label style={styles.label}>Message</label>
                      <textarea
                        style={{ ...styles.input, height: 80 }}
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                      />
                    </div>

                    <button style={styles.requestBtn} type="submit" disabled={requesting}>
                      {requesting ? 'Sending...' : '🚀 Send Request'}
                    </button>
                  </form>
                )}

                {item.listingType === 'Sell' && (
                  <div style={styles.sellBox}>
                    <h3 style={styles.requestTitle}>💰 Buy This Item</h3>
                    <p style={styles.sellPrice}>₹{item.sellingPrice}</p>
                  </div>
                )}

                {item.listingType === 'Free' && (
                  <div style={styles.freeBox}>
                    <h3 style={styles.requestTitle}>🎁 Get This for Free</h3>
                  </div>
                )}

                {item.listingType === 'Rent' && !item.isAvailable && (
                  <div style={styles.unavailableNote}>❌ Currently rented out</div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: '#f0f4f8', padding: '24px 20px' },
  container: { maxWidth: 1100, margin: '0 auto' },
  backBtn: { background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginBottom: 20 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28 },
  imgBox: { borderRadius: 16, overflow: 'hidden', height: 340, marginBottom: 12 },
  mainImg: { width: '100%', height: '100%', objectFit: 'cover' },
  noImg: { width: '100%', height: '100%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 },
  thumbs: { display: 'flex', gap: 8, marginBottom: 16 },
  thumb: { width: 70, height: 70, borderRadius: 8, objectFit: 'cover', border: '2px solid #e5e7eb' },
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
  actionCard: { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', position: 'sticky', top: 80 },
  msgBtn: { display: 'block', textAlign: 'center', padding: '12px', background: '#f3f4f6', color: '#374151', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none', marginBottom: 20 },
  requestTitle: { fontSize: 18, fontWeight: 700, color: '#1a202c', marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151', fontSize: 14 },
  input: { width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 10, fontSize: 14, boxSizing: 'border-box' },
  summary: { background: '#eef2ff', borderRadius: 10, padding: 14, marginBottom: 16, color: '#4f46e5' },
  totalAmount: { fontSize: 20, fontWeight: 800, marginTop: 4 },
  requestBtn: { width: '100%', padding: 14, background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer' },
  sellBox: { background: '#fef3c7', borderRadius: 12, padding: 20, marginTop: 16 },
  sellPrice: { fontSize: 32, fontWeight: 800, color: '#92400e', marginBottom: 8 },
  sellNote: { color: '#78350f', fontSize: 14 },
  freeBox: { background: '#d1fae5', borderRadius: 12, padding: 20, marginTop: 16 },
  ownerNote: { background: '#d1fae5', color: '#065f46', padding: 20, borderRadius: 16, textAlign: 'center', fontWeight: 600 },
  unavailableNote: { background: '#fee2e2', color: '#991b1b', padding: 20, borderRadius: 16, textAlign: 'center', fontWeight: 600, marginTop: 16 },
  center: { textAlign: 'center', padding: 60 },
};

export default ItemDetail;