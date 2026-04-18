import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Books', 'Electronics', 'Lab Equipment', 'Clothing', 'Other'];
const CAT_ICONS = { All: '🌟', Books: '📚', Electronics: '💻', 'Lab Equipment': '🔬', Clothing: '👕', Other: '📦' };

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('All');
  const [hovered, setHovered] = useState(null);
  const navigate = useNavigate();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      const { data } = await API.get('/items', { params });
      setItems(data.items);
    } catch {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [search, category]);

  const getPrice = (item) => {
    if (item.listingType === 'Free') return { label: '🎁 Free', color: '#2E7D32' };
    if (item.listingType === 'Sell') return { label: `₹${item.sellingPrice}`, color: '#D97706' };
    return { label: `₹${item.pricePerDay}/day`, color: '#2E7D32' };
  };

  const getTypeBadge = (type) => {
    if (type === 'Free') return { bg: '#DCFCE7', color: '#15803D', label: '🎁 Free' };
    if (type === 'Sell') return { bg: '#FEF3C7', color: '#D97706', label: '💰 For Sale' };
    return { bg: '#E8F5E9', color: '#2E7D32', label: '🔄 For Rent' };
  };

  // ✅ BASE URL FIX (IMPORTANT)
  const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

  return (
    <div style={s.page}>
      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroContent}>
          <h1 style={s.heroTitle}>
            Share, Rent & Connect<br />
            <span style={s.heroAccent}>on Your Campus</span>
          </h1>
          <p style={s.heroSub}>
            A sustainable marketplace for college students — rent textbooks, buy equipment, or give items away for free.
          </p>

          <form onSubmit={e => { e.preventDefault(); setSearch(searchInput); }} style={s.searchForm}>
            <div style={s.searchBox}>
              <span style={s.searchIcon}>🔍</span>
              <input
                style={s.searchInput}
                placeholder="Search textbooks, calculators, lab coats..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button type="button" style={s.clearBtn} onClick={() => { setSearchInput(''); setSearch(''); }}>✕</button>
              )}
              <button type="submit" style={s.searchBtn}>Search</button>
            </div>
          </form>
        </div>
      </div>

      {/* Main */}
      <div style={s.main}>
        {/* Sidebar */}
        <div style={s.sidebar}>
          <div style={s.sideCard}>
            <p style={s.sideCardLabel}>Categories</p>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{ ...s.catBtn, ...(category === cat ? s.catBtnActive : {}) }}
              >
                <span style={s.catIcon}>{CAT_ICONS[cat]}</span>
                <span>{cat}</span>
                {category === cat && <span style={s.catCheck}>✓</span>}
              </button>
            ))}
          </div>

          <div style={s.listingCTA}>
            <div style={s.ctaIcon}>📦</div>
            <p style={s.ctaTitle}>Have something to share?</p>
            <p style={s.ctaText}>List your items and help fellow students save money.</p>
            <button style={s.ctaBtn} onClick={() => navigate('/add-item')}>+ List an Item</button>
          </div>
        </div>

        {/* Grid */}
        <div style={s.content}>
          <div style={s.contentHeader}>
            <p style={s.resultCount}>
              {loading ? 'Loading...' : `${items.length} item${items.length !== 1 ? 's' : ''} found`}
              {category !== 'All' && ` in ${category}`}
            </p>
          </div>

          {loading ? (
            <div style={s.grid}>
              {[...Array(6)].map((_, i) => <div key={i} style={s.skeleton} />)}
            </div>
          ) : items.length === 0 ? (
            <div style={s.empty}>
              <div style={s.emptyEmoji}>🔍</div>
              <h3 style={s.emptyTitle}>No items found</h3>
              <p style={s.emptyText}>Try a different search or category</p>
              <button style={s.emptyBtn} onClick={() => navigate('/add-item')}>List the first item</button>
            </div>
          ) : (
            <div style={s.grid}>
              {items.map(item => {
                const price = getPrice(item);
                const badge = getTypeBadge(item.listingType);
                const isHov = hovered === item._id;

                return (
                  <div
                    key={item._id}
                    style={{ ...s.card, ...(isHov ? s.cardHov : {}) }}
                    onClick={() => navigate(`/item/${item._id}`)}
                    onMouseEnter={() => setHovered(item._id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div style={s.cardImg}>
                      {item.images?.[0] ? (
                        <img
                          src={`${BASE_URL}${item.images[0]}`}
                          alt={item.title}
                          style={s.img}
                        />
                      ) : (
                        <div style={s.noImg}>
                          <span style={{ fontSize: 44 }}>{CAT_ICONS[item.category]}</span>
                        </div>
                      )}

                      <span style={{ ...s.typeBadge, background: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                    </div>

                    <div style={s.cardBody}>
                      <div style={s.cardMeta}>
                        <span style={s.cardCat}>{item.category}</span>
                        <span style={s.cardRating}>⭐ {item.rating > 0 ? item.rating : 'New'}</span>
                      </div>

                      <h3 style={s.cardTitle}>{item.title}</h3>
                      <p style={s.cardDesc}>{item.description?.substring(0, 70)}...</p>

                      <div style={s.cardFooter}>
                        <span style={{ ...s.price, color: price.color }}>{price.label}</span>
                        <div style={s.ownerRow}>
                          <div style={s.ownerAvatar}>{item.owner?.name?.charAt(0)}</div>
                          <span style={s.ownerName}>{item.owner?.name?.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#F1F8F4' },
  hero: { background: 'linear-gradient(160deg, #2E7D32 0%, #1B5E20 100%)', padding: '64px 24px 56px', position: 'relative', overflow: 'hidden' },
  heroContent: { maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 },
  heroBadge: { display: 'inline-block', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, marginBottom: 20 },
  heroTitle: { fontSize: 48, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 14, fontFamily: 'Poppins, sans-serif' },
  heroAccent: { color: '#A5D6A7' },
  heroSub: { fontSize: 16, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: 32 },
  searchForm: { marginBottom: 32 },
  searchBox: { display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 12, padding: '6px 6px 6px 18px', maxWidth: 580, margin: '0 auto', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' },
  searchIcon: { fontSize: 18, marginRight: 10, color: '#9CA3AF', flexShrink: 0 },
  searchInput: { flex: 1, background: 'transparent', border: 'none', color: '#1B1B1B', fontSize: 15, padding: '8px 0' },
  clearBtn: { padding: '4px 8px', background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 12 },
  searchBtn: { padding: '10px 22px', background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', flexShrink: 0 },
  heroStats: { display: 'flex', justifyContent: 'center', gap: 40 },
  heroStat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  heroStatNum: { fontSize: 26, fontWeight: 800, color: '#fff', fontFamily: 'Poppins, sans-serif' },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 },
  main: { maxWidth: 1200, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 28 },
  sidebar: { display: 'flex', flexDirection: 'column', gap: 16 },
  sideCard: { background: '#fff', borderRadius: 14, padding: '20px 16px', boxShadow: '0 2px 8px rgba(46,125,50,0.08)', border: '1px solid #E2EFE6' },
  sideCardLabel: { fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12, paddingLeft: 4 },
  catBtn: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, border: 'none', background: 'transparent', color: '#6B7280', fontWeight: 500, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', width: '100%', marginBottom: 2 },
  catBtnActive: { background: '#E8F5E9', color: '#2E7D32', fontWeight: 600 },
  catIcon: { fontSize: 16, width: 22, textAlign: 'center' },
  catCheck: { marginLeft: 'auto', color: '#2E7D32', fontWeight: 700, fontSize: 13 },
  listingCTA: { background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(46,125,50,0.08)', border: '1px solid #E2EFE6', textAlign: 'center' },
  ctaIcon: { fontSize: 32, marginBottom: 10 },
  ctaTitle: { fontSize: 14, fontWeight: 700, color: '#1B1B1B', marginBottom: 6 },
  ctaText: { fontSize: 12, color: '#6B7280', lineHeight: 1.5, marginBottom: 14 },
  ctaBtn: { width: '100%', padding: '10px', background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  content: { minWidth: 0 },
  contentHeader: { marginBottom: 18 },
  resultCount: { fontSize: 14, color: '#6B7280' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 },
  skeleton: { height: 320, borderRadius: 14, background: 'linear-gradient(90deg, #E8F5E9 25%, #F1F8F4 50%, #E8F5E9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' },
  empty: { textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 16, border: '1px solid #E2EFE6' },
  emptyEmoji: { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontSize: 20, fontWeight: 700, color: '#1B1B1B', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  emptyBtn: { padding: '11px 24px', background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  card: { background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #E2EFE6', cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: '0 2px 8px rgba(46,125,50,0.06)' },
  cardHov: { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(46,125,50,0.15)', border: '1px solid #A5D6A7' },
  cardImg: { position: 'relative', height: 190 },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  noImg: { width: '100%', height: '100%', background: '#F1F8F4', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  typeBadge: { position: 'absolute', top: 10, left: 10, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 },
  cardBody: { padding: '14px 16px' },
  cardMeta: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  cardCat: { fontSize: 11, color: '#9CA3AF', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardRating: { fontSize: 11, color: '#D97706' },
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#1B1B1B', marginBottom: 6, lineHeight: 1.3 },
  cardDesc: { fontSize: 12, color: '#6B7280', lineHeight: 1.5, marginBottom: 12 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #F1F8F4' },
  price: { fontSize: 17, fontWeight: 800, fontFamily: 'Poppins, sans-serif' },
  ownerRow: { display: 'flex', alignItems: 'center', gap: 6 },
  ownerAvatar: { width: 22, height: 22, borderRadius: '50%', background: '#A5D6A7', color: '#1B5E20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 },
  ownerName: { fontSize: 12, color: '#6B7280' },
};
