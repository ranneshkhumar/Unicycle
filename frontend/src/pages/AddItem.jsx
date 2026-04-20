import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Books', 'Electronics', 'Lab Equipment', 'Clothing', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

export default function AddItem() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Books',
    listingType: 'Rent',
    pricePerDay: '',
    sellingPrice: '',
    availableTo: '',
    condition: 'Good',
    tags: '',
    penalty: '',
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.forEach(img => formData.append('images', img));
      await API.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Item listed successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item');
    } finally { setLoading(false); }
  };

  const typeOptions = [
    { value: 'Rent', label: '🔄 For Rent', desc: 'Lend it by the day', activeColor: '#2E7D32', activeBg: '#E8F5E9', activeBorder: '#A5D6A7' },
    { value: 'Sell', label: '💰 For Sale', desc: 'Sell it once', activeColor: '#D97706', activeBg: '#FEF3C7', activeBorder: '#FDE68A' },
    { value: 'Free', label: '🎁 Free', desc: 'Give it away', activeColor: '#0284C7', activeBg: '#E0F2FE', activeBorder: '#BAE6FD' },
  ];

  return (
    <div style={s.page}>
      <div style={s.container(isMobile)}>

        {/* Page Header */}
        <div style={s.pageHeader(isMobile)}>
          <button style={s.backBtn} onClick={() => navigate('/')}>← Back to Browse</button>
          <div>
            <h1 style={s.pageTitle}>List an Item</h1>
            <p style={s.pageSubtitle}>Share your items with the College campus community</p>
          </div>
        </div>

        <div style={s.layout(isMobile)}>
          {/* Main Form */}
          <div style={s.formCard(isMobile)}>
            <form onSubmit={handleSubmit}>

              {/* Listing Type */}
              <div style={s.section}>
                <p style={s.sectionLabel}>Listing Type</p>
                <div style={s.typeGrid(isMobile)}>
                  {typeOptions.map(t => {
                    const isActive = form.listingType === t.value;
                    return (
                      <button key={t.value} type="button"
                        onClick={() => setForm({ ...form, listingType: t.value })}
                        style={{
                          ...s.typeBtn,
                          ...(isActive ? {
                            background: t.activeBg,
                            border: `2px solid ${t.activeBorder}`,
                            color: t.activeColor,
                          } : {}),
                        }}>
                        <span style={s.typeBtnEmoji}>{t.label.split(' ')[0]}</span>
                        <span style={{ ...s.typeBtnLabel, color: isActive ? t.activeColor : '#1B1B1B' }}>
                          {t.label.split(' ').slice(1).join(' ')}
                        </span>
                        <span style={{ ...s.typeBtnDesc, color: isActive ? t.activeColor : '#9CA3AF' }}>
                          {t.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Basic Details */}
              <div style={s.section}>
                <p style={s.sectionLabel}>Item Details</p>
                <div style={s.grid2(isMobile)}>
                  <div style={s.field}>
                    <label style={s.label}>Item Title *</label>
                    <input
                      style={s.input}
                      type="text"
                      placeholder="e.g. Engineering Mathematics Textbook"
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>

                  <div style={s.field}>
                    <label style={s.label}>Category *</label>
                    <select style={s.input} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {form.listingType === 'Rent' && (
                    <>
                      <div style={s.field}>
                        <label style={s.label}>Price per Day (₹) *</label>
                        <input
                          style={s.input}
                          type="number"
                          placeholder="e.g. 30"
                          min="0"
                          value={form.pricePerDay}
                          onChange={e => setForm({ ...form, pricePerDay: e.target.value })}
                          required
                        />
                      </div>
                      <div style={s.field}>
                        <label style={s.label}>Available Until *</label>
                        <input
                          style={s.input}
                          type="date"
                          value={form.availableTo}
                          onChange={e => setForm({ ...form, availableTo: e.target.value })}
                          required
                        />
                      </div>
                      <div style={s.field}>
                        <label style={s.label}>Damage Penalty (if needed)</label>
                        <input
                          style={s.input}
                          type="text"
                          placeholder="e.g. ₹50 fine or full replacement cost"
                          value={form.penalty}
                          onChange={e => setForm({ ...form, penalty: e.target.value })}
                        />
                        <small style={{ color: "#6b6375", fontSize: 12 }}>
                          Clearly mention the penalty if the item is damaged
                        </small>
                      </div>
                    </>
                  )}

                  {form.listingType === 'Sell' && (
                    <div style={s.field}>
                      <label style={s.label}>Selling Price (₹) *</label>
                      <input
                        style={s.input}
                        type="number"
                        placeholder="e.g. 299"
                        min="0"
                        value={form.sellingPrice}
                        onChange={e => setForm({ ...form, sellingPrice: e.target.value })}
                        required
                      />
                    </div>
                  )}

                  {form.listingType === 'Free' && (
                    <div style={s.field}>
                      <label style={s.label}>Available Until</label>
                      <input
                        style={s.input}
                        type="date"
                        value={form.availableTo}
                        onChange={e => setForm({ ...form, availableTo: e.target.value })}
                      />
                    </div>
                  )}

                  <div style={s.field}>
                    <label style={s.label}>Condition</label>
                    <select style={s.input} value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>
                      {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div style={s.field}>
                    <label style={s.label}>Tags (comma separated)</label>
                    <input
                      style={s.input}
                      type="text"
                      placeholder="e.g. maths, semester 3, cse"
                      value={form.tags}
                      onChange={e => setForm({ ...form, tags: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ ...s.field, marginTop: 16 }}>
                  <label style={s.label}>Description *</label>
                  <textarea
                    style={{ ...s.input, height: 110, resize: 'vertical' }}
                    placeholder="Describe your item — condition, edition, why you're listing it..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Images */}
              <div style={s.section}>
                <p style={s.sectionLabel}>Photos</p>
                <label style={s.uploadBox}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={e => setImages(Array.from(e.target.files).slice(0, 5))}
                  />
                  <span style={s.uploadIcon}>📷</span>
                  <span style={s.uploadText}>Click to upload photos</span>
                  <span style={s.uploadHint}>Up to 5 images · JPG, PNG, WebP · Max 5MB each</span>
                </label>

                {images.length > 0 && (
                  <div style={s.previews}>
                    {images.map((img, i) => (
                      <div key={i} style={s.previewBox}>
                        <img src={URL.createObjectURL(img)} alt="" style={s.previewImg} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div style={s.btnRow(isMobile)}>
                <button type="button" style={s.cancelBtn} onClick={() => navigate('/')}>
                  Cancel
                </button>
                <button type="submit" style={s.submitBtn} disabled={loading}>
                  {loading ? 'Publishing...' : '🚀 Publish Listing'}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar (Preview + Tips) */}
          <div style={s.sidebar(isMobile)}>
            {/* Live Preview */}
            <div style={s.previewCard}>
              <p style={s.previewLabel}>Preview</p>
              <div style={s.itemPreview}>
                <div style={s.previewImgBox}>
                  {images[0]
                    ? <img src={URL.createObjectURL(images[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 40 }}>📦</span>}
                </div>
                <div style={s.previewBody}>
                  <p style={s.previewCategory}>{form.category}</p>
                  <p style={s.previewTitle}>{form.title || 'Your item title'}</p>
                  <p style={{
                    ...s.previewPrice,
                    color: form.listingType === 'Free' ? '#0284C7' : form.listingType === 'Sell' ? '#D97706' : '#2E7D32',
                  }}>
                    {form.listingType === 'Free' ? '🎁 Free'
                      : form.listingType === 'Sell' ? `₹${form.sellingPrice || '0'}`
                      : `₹${form.pricePerDay || '0'}/day`}
                  </p>
                  <div style={{
                    ...s.typePill,
                    background: form.listingType === 'Free' ? '#E0F2FE' : form.listingType === 'Sell' ? '#FEF3C7' : '#E8F5E9',
                    color: form.listingType === 'Free' ? '#0284C7' : form.listingType === 'Sell' ? '#D97706' : '#2E7D32',
                  }}>
                    {form.listingType === 'Free' ? '🎁 Free' : form.listingType === 'Sell' ? '💰 For Sale' : '🔄 For Rent'}
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div style={s.tipsCard}>
              <p style={s.tipsTitle}>💡 Tips for a great listing</p>
              {[
                'Add clear, well-lit photos',
                'Write a detailed description',
                'Set a fair and competitive price',
                'Mention the item condition',
                'Respond quickly to requests',
              ].map((tip, i) => (
                <div key={i} style={s.tip}>
                  <span style={s.tipCheck}>✓</span>
                  <span style={s.tipText}>{tip}</span>
                </div>
              ))}
            </div>

            {/* Guidelines */}
            <div style={s.guidelinesCard}>
              <p style={s.guidelinesTitle}>📋 Guidelines</p>
              <p style={s.guidelinesText}>Only list items you own. Do not list prohibited items. Be honest about the condition. Meet in safe, public campus locations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== RESPONSIVE STYLES ==================== */
const s = {
  page: { minHeight: '100vh', background: '#F1F8F4' },

  container: (isMobile) => ({
    maxWidth: 1100,
    margin: '0 auto',
    padding: isMobile ? '24px 16px' : '32px 24px'
  }),

  pageHeader: (isMobile) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    marginBottom: 28,
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'flex-start' : 'center'
  }),

  backBtn: { 
    padding: '8px 16px', 
    background: '#fff', 
    border: '1.5px solid #E2EFE6', 
    borderRadius: 8, 
    color: '#6B7280', 
    cursor: 'pointer', 
    fontSize: 13, 
    fontWeight: 500, 
    flexShrink: 0, 
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)' 
  },

  pageTitle: { fontSize: 28, fontWeight: 800, color: '#1B1B1B', fontFamily: 'Poppins, sans-serif' },
  pageSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },

  layout: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 300px',
    gap: isMobile ? 32 : 24,
    alignItems: 'start'
  }),

  formCard: (isMobile) => ({
    background: '#fff',
    border: '1px solid #E2EFE6',
    borderRadius: 16,
    padding: isMobile ? 24 : 32,
    boxShadow: '0 4px 16px rgba(46,125,50,0.08)'
  }),

  section: { marginBottom: 28 },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 },

  typeGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
    gap: 12
  }),

  typeBtn: { 
    padding: '16px 12px', 
    background: '#F9FBF9', 
    border: '2px solid #E2EFE6', 
    borderRadius: 12, 
    cursor: 'pointer', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    gap: 4, 
    transition: 'all 0.2s' 
  },
  typeBtnEmoji: { fontSize: 24, marginBottom: 2 },
  typeBtnLabel: { fontSize: 14, fontWeight: 700 },
  typeBtnDesc: { fontSize: 11, textAlign: 'center' },

  grid2: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: 16
  }),

  field: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: { 
    padding: '11px 14px', 
    background: '#F9FBF9', 
    border: '1.5px solid #E2EFE6', 
    borderRadius: 10, 
    color: '#1B1B1B', 
    fontSize: 14, 
    width: '100%', 
    boxSizing: 'border-box', 
    transition: 'all 0.2s' 
  },

  uploadBox: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    gap: 8, 
    padding: '32px 20px', 
    background: '#F9FBF9', 
    border: '2px dashed #A5D6A7', 
    borderRadius: 12, 
    cursor: 'pointer', 
    transition: 'all 0.2s' 
  },
  uploadIcon: { fontSize: 36 },
  uploadText: { fontSize: 15, color: '#374151', fontWeight: 600 },
  uploadHint: { fontSize: 12, color: '#9CA3AF' },

  previews: { display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' },
  previewBox: { width: 76, height: 76, borderRadius: 10, overflow: 'hidden', border: '1.5px solid #E2EFE6' },
  previewImg: { width: '100%', height: '100%', objectFit: 'cover' },

  btnRow: (isMobile) => ({
    display: 'flex',
    gap: 12,
    justifyContent: isMobile ? 'stretch' : 'flex-end',
    paddingTop: 8,
    borderTop: '1px solid #F1F8F4',
    flexDirection: isMobile ? 'column' : 'row'
  }),

  cancelBtn: { 
    padding: '12px 24px', 
    background: '#F3F4F6', 
    border: '1px solid #E5E7EB', 
    borderRadius: 10, 
    color: '#6B7280', 
    cursor: 'pointer', 
    fontSize: 14, 
    fontWeight: 500,
    flex: 1
  },
  submitBtn: { 
    padding: '12px 28px', 
    background: 'linear-gradient(135deg, #2E7D32, #1B5E20)', 
    color: '#fff', 
    border: 'none', 
    borderRadius: 10, 
    fontSize: 15, 
    fontWeight: 600, 
    cursor: 'pointer', 
    boxShadow: '0 4px 16px rgba(46,125,50,0.3)',
    flex: 1
  },

  sidebar: (isMobile) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    position: isMobile ? 'static' : 'sticky',
    top: 80
  }),

  previewCard: { background: '#fff', border: '1px solid #E2EFE6', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(46,125,50,0.06)' },
  previewLabel: { fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1.2, padding: '14px 16px 0' },
  itemPreview: {},
  previewImgBox: { height: 160, background: '#F1F8F4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '10px 16px', borderRadius: 10, overflow: 'hidden' },
  previewBody: { padding: '12px 16px 16px' },
  previewCategory: { fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  previewTitle: { fontSize: 15, fontWeight: 700, color: '#1B1B1B', marginBottom: 8, fontFamily: 'Poppins, sans-serif' },
  previewPrice: { fontSize: 20, fontWeight: 800, marginBottom: 8, fontFamily: 'Poppins, sans-serif' },
  typePill: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 },

  tipsCard: { background: '#fff', border: '1px solid #E2EFE6', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 8px rgba(46,125,50,0.06)' },
  tipsTitle: { fontSize: 14, fontWeight: 700, color: '#1B1B1B', marginBottom: 14 },
  tip: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  tipCheck: { width: 18, height: 18, borderRadius: '50%', background: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1 },
  tipText: { fontSize: 13, color: '#6B7280', lineHeight: 1.4 },

  guidelinesCard: { background: '#FEF9C3', border: '1px solid #FDE68A', borderRadius: 14, padding: '16px 18px' },
  guidelinesTitle: { fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 8 },
  guidelinesText: { fontSize: 12, color: '#78350F', lineHeight: 1.6 },
};