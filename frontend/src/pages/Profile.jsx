import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', university: '', bio: '' });
  const [profileImage, setProfileImage] = useState(null);

  // ✅ BASE URL FIX
  const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        university: user.university || '',
        bio: user.bio || ''
      });
      fetchMyItems();
    }
  }, [user]);

  const fetchMyItems = async () => {
    try {
      const { data } = await API.get('/items/user/my-items');
      setItems(data.items);
    } catch {}
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('university', form.university);
      formData.append('bio', form.bio);
      if (profileImage) formData.append('profileImage', profileImage);

      const { data } = await API.put('/users/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Remove this item?')) return;
    try {
      await API.delete(`/items/${id}`);
      toast.success('Item removed');
      fetchMyItems();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.profileCard}>
          <div style={s.profileBanner} />

          <div style={s.profileMain}>
            <div style={s.avatarWrap}>
              {user?.profileImage ? (
                <img src={`${BASE_URL}${user.profileImage}`} alt="" style={s.avatar} />
              ) : (
                <div style={s.avatarFallback}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}

              {editing && (
                <label style={s.changePhoto}>
                  📷
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => setProfileImage(e.target.files[0])}
                  />
                </label>
              )}
            </div>

            {!editing ? (
              <div style={s.profileInfo}>
                <div style={s.profileTop}>
                  <div>
                    <h1 style={s.profileName}>{user?.name}</h1>
                    <p style={s.profileEmail}>📧 {user?.email}</p>
                    {user?.university && <p style={s.profileUni}>🎓 {user.university}</p>}
                    {user?.bio && <p style={s.profileBio}>"{user.bio}"</p>}
                  </div>

                  <button style={s.editBtn} onClick={() => setEditing(true)}>
                    ✏️ Edit Profile
                  </button>
                </div>

                <div style={s.statsRow}>
                  {[
                    { label: 'Items Listed', value: items.length },
                    { label: 'Rating', value: `⭐ ${user?.rating || '0'}` },
                    { label: 'Role', value: user?.role },
                  ].map(stat => (
                    <div key={stat.label} style={s.stat}>
                      <span style={s.statVal}>{stat.value}</span>
                      <span style={s.statLabel}>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdate} style={s.editForm}>
                <h3 style={s.editTitle}>Edit Profile</h3>

                {[
                  { key: 'name', label: 'Name' },
                  { key: 'university', label: 'University' }
                ].map(f => (
                  <div key={f.key} style={s.field}>
                    <label style={s.label}>{f.label}</label>
                    <input
                      style={s.input}
                      value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    />
                  </div>
                ))}

                <div style={s.field}>
                  <label style={s.label}>Bio</label>
                  <textarea
                    style={{ ...s.input, height: 80 }}
                    value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                  />
                </div>

                <div style={s.editBtns}>
                  <button type="button" style={s.cancelBtn} onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" style={s.saveBtn} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ITEMS */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>My Listings</h2>
            <span style={s.sectionCount}>{items.length} items</span>
          </div>

          {items.length === 0 ? (
            <div style={s.empty}>
              <p style={{ fontSize: 40 }}>📭</p>
              <p style={s.emptyText}>No items listed yet</p>
            </div>
          ) : (
            <div style={s.itemsGrid}>
              {items.map(item => (
                <div key={item._id} style={s.itemCard}>
                  <div style={s.itemImg}>
                    {item.images?.[0] ? (
                      <img
                        src={`${BASE_URL}${item.images[0]}`}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={s.noImg}>📦</div>
                    )}

                    <span style={{
                      ...s.availBadge,
                      background: item.isAvailable ? '#DCFCE7' : '#FEF3C7',
                      color: item.isAvailable ? '#15803D' : '#D97706'
                    }}>
                      {item.isAvailable ? 'Available' : 'Rented'}
                    </span>
                  </div>

                  <div style={s.itemBody}>
                    <p style={s.itemTitle}>{item.title}</p>
                    <p style={s.itemPrice}>
                      {item.listingType === 'Free'
                        ? '🎁 Free'
                        : item.listingType === 'Sell'
                          ? `₹${item.sellingPrice}`
                          : `₹${item.pricePerDay}/day`}
                    </p>
                  </div>

                  <button style={s.deleteBtn} onClick={() => handleDeleteItem(item._id)}>
                    🗑 Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#F1F8F4' },
  container: { maxWidth: 960, margin: '0 auto', padding: '36px 24px' },
  profileCard: { background: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 24, border: '1px solid #E2EFE6', boxShadow: '0 4px 16px rgba(46,125,50,0.08)' },
  profileBanner: { height: 100, background: 'linear-gradient(135deg, #2E7D32, #66BB6A)' },
  profileMain: { padding: '0 32px 28px', marginTop: -40 },
  avatarWrap: { position: 'relative', display: 'inline-block', marginBottom: 16 },
  avatar: { width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 12px rgba(46,125,50,0.2)' },
  avatarFallback: { width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg, #2E7D32, #66BB6A)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, border: '4px solid #fff', boxShadow: '0 4px 12px rgba(46,125,50,0.2)' },
  changePhoto: { position: 'absolute', bottom: 2, right: 2, width: 26, height: 26, borderRadius: '50%', background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, border: '2px solid #fff' },
  profileInfo: { width: '100%' },
  profileTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  profileName: { fontSize: 24, fontWeight: 700, color: '#1B1B1B', marginBottom: 4, fontFamily: 'Poppins, sans-serif' },
  profileEmail: { fontSize: 14, color: '#6B7280', marginBottom: 3 },
  profileUni: { fontSize: 14, color: '#6B7280', marginBottom: 3 },
  profileBio: { fontSize: 14, color: '#374151', fontStyle: 'italic', marginTop: 6 },
  editBtn: { padding: '9px 20px', background: '#E8F5E9', border: '1.5px solid #A5D6A7', borderRadius: 8, color: '#2E7D32', fontWeight: 600, cursor: 'pointer', fontSize: 13 },
  statsRow: { display: 'flex', gap: 32 },
  stat: { display: 'flex', flexDirection: 'column', gap: 2 },
  statVal: { fontSize: 22, fontWeight: 700, color: '#2E7D32', fontFamily: 'Poppins, sans-serif', textTransform: 'capitalize' },
  statLabel: { fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 },
  editForm: { width: '100%' },
  editTitle: { fontSize: 18, fontWeight: 700, color: '#1B1B1B', marginBottom: 16 },
  field: { marginBottom: 14 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: { width: '100%', padding: '11px 14px', background: '#F9FBF9', border: '1.5px solid #E2EFE6', borderRadius: 8, color: '#1B1B1B', fontSize: 14, boxSizing: 'border-box' },
  editBtns: { display: 'flex', gap: 10, marginTop: 4 },
  cancelBtn: { padding: '10px 20px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 8, color: '#6B7280', cursor: 'pointer', fontSize: 14 },
  saveBtn: { padding: '10px 20px', background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  section: { background: '#fff', border: '1px solid #E2EFE6', borderRadius: 16, padding: 28, boxShadow: '0 2px 8px rgba(46,125,50,0.06)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 700, color: '#1B1B1B', fontFamily: 'Poppins, sans-serif' },
  sectionCount: { fontSize: 13, color: '#6B7280', background: '#F1F8F4', padding: '4px 12px', borderRadius: 20, border: '1px solid #E2EFE6' },
  itemsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 },
  itemCard: { background: '#F9FBF9', border: '1px solid #E2EFE6', borderRadius: 12, overflow: 'hidden' },
  itemImg: { height: 130, position: 'relative', background: '#F1F8F4', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  noImg: { fontSize: 32 },
  availBadge: { position: 'absolute', top: 8, right: 8, padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 },
  itemBody: { padding: '10px 14px 6px' },
  itemTitle: { fontSize: 13, fontWeight: 700, color: '#1B1B1B', marginBottom: 4 },
  itemPrice: { fontSize: 14, fontWeight: 700, color: '#2E7D32' },
  deleteBtn: { margin: '6px 14px 12px', padding: '5px 10px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 6, color: '#DC2626', cursor: 'pointer', fontSize: 11, fontWeight: 600 },
  empty: { textAlign: 'center', padding: '40px 0' },
  emptyText: { color: '#6B7280', fontSize: 14 },
};