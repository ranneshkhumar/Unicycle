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

  // ✅ Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

  return (
    <div style={s.page}>
      {/* HERO */}
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
                placeholder="Search items..."
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

      {/* MAIN */}
      <div style={{
        ...s.main,
        gridTemplateColumns: isMobile ? '1fr' : '220px 1fr'
      }}>

        {/* SIDEBAR */}
        {!isMobile && (
          <div style={s.sidebar}>
            <div style={s.sideCard}>
              <p style={s.sideCardLabel}>Categories</p>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{ ...s.catBtn, ...(category === cat ? s.catBtnActive : {}) }}
                >
                  <span>{CAT_ICONS[cat]}</span>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CONTENT */}
        <div style={s.content}>
          <p style={s.resultCount}>
            {loading ? 'Loading...' : `${items.length} items`}
          </p>

          <div style={s.grid}>
            {items.map(item => {
              const price = getPrice(item);
              const badge = getTypeBadge(item.listingType);

              return (
                <div
                  key={item._id}
                  style={s.card}
                  onClick={() => navigate(`/item/${item._id}`)}
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
                        {CAT_ICONS[item.category]}
                      </div>
                    )}

                    <span style={{ ...s.typeBadge, background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </div>

                  <div style={s.cardBody}>
                    <h3 style={s.cardTitle}>{item.title}</h3>

                    <div style={s.cardFooter}>
                      <span style={{ ...s.price, color: price.color }}>
                        {price.label}
                      </span>

                      <span style={s.ownerName}>
                        {item.owner?.name?.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#F1F8F4', overflowX: 'hidden' },

  hero: { padding: '40px 16px', background: '#2E7D32' },
  heroContent: { textAlign: 'center', maxWidth: 600, margin: '0 auto' },

  heroTitle: {
    fontSize: 'clamp(28px, 6vw, 48px)',
    color: '#fff',
    fontWeight: 800
  },

  heroAccent: { color: '#A5D6A7' },

  heroSub: { color: '#fff', marginTop: 10 },

  searchBox: {
    display: 'flex',
    flexWrap: 'wrap',
    background: '#fff',
    borderRadius: 10,
    padding: 10,
    marginTop: 20
  },

  searchInput: { flex: 1, border: 'none', outline: 'none' },

  searchBtn: {
    background: '#2E7D32',
    color: '#fff',
    border: 'none',
    padding: '8px 12px'
  },

  main: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: 20,
    display: 'grid',
    gap: 20
  },

  sidebar: {},

  content: {},

  resultCount: { marginBottom: 10 },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16
  },

  card: {
    background: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    cursor: 'pointer'
  },

  cardImg: { height: 'clamp(140px, 40vw, 190px)' },

  img: { width: '100%', height: '100%', objectFit: 'cover' },

  noImg: {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  cardBody: { padding: 10 },

  cardTitle: { fontSize: 14 },

  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between'
  },

  price: { fontWeight: 'bold' },

  ownerName: { fontSize: 12 }
};