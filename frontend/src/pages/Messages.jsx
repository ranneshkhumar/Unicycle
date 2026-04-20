import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Messages() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeConv, setActiveConv] = useState(userId || null);
  const [showChat, setShowChat] = useState(false); // For mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const bottomRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { fetchInbox(); }, []);
  useEffect(() => { if (activeConv) fetchConversation(activeConv); }, [activeConv]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Auto open chat if coming from URL param
  useEffect(() => {
    if (userId) {
      setActiveConv(userId);
      if (isMobile) setShowChat(true);
    }
  }, [userId, isMobile]);

  const fetchInbox = async () => {
    try {
      const { data } = await API.get('/messages/inbox');
      setConversations(data.conversations);
    } catch {}
  };

  const fetchConversation = async (uid) => {
    try {
      const { data } = await API.get(`/messages/${uid}`);
      setMessages(data.messages);
      if (data.messages.length > 0) {
        const msg = data.messages[0];
        setOtherUser(msg.sender._id === user._id ? msg.receiver : msg.sender);
      } else {
        try {
          const r = await API.get(`/users/${uid}`);
          setOtherUser(r.data.user);
        } catch {}
      }
    } catch {}
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;
    setLoading(true);
    try {
      const { data } = await API.post('/messages', { receiverId: activeConv, text });
      setMessages(prev => [...prev, data.message]);
      setText('');
      fetchInbox();
    } catch {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const openConversation = (uid, other) => {
    setActiveConv(uid);
    setOtherUser(other);
    if (isMobile) setShowChat(true);
  };

  const getOther = (conv) => conv.sender._id === user._id ? conv.receiver : conv.sender;

  const closeChat = () => {
    setShowChat(false);
    // Optional: clear active if you want
    // setActiveConv(null);
  };

  return (
    <div style={s.page}>
      <div style={s.container(isMobile)}>
        <div style={s.header}>
          <h1 style={s.title}>Messages</h1>
          <p style={s.subtitle}>Chat with buyers, sellers and renters</p>
        </div>

        <div style={s.layout(isMobile)}>
          {/* Inbox Sidebar */}
          {(!isMobile || !showChat) && (
            <div style={s.inbox(isMobile)}>
              <p style={s.inboxLabel}>Conversations</p>
              {conversations.length === 0 ? (
                <div style={s.emptyInbox}>
                  <p style={{ fontSize: 32, marginBottom: 8 }}>💬</p>
                  <p style={{ color: '#9CA3AF', fontSize: 13 }}>No conversations yet</p>
                </div>
              ) : (
                conversations.map(conv => {
                  const other = getOther(conv);
                  const isActive = activeConv === other?._id;
                  return (
                    <div
                      key={conv._id}
                      style={{ ...s.convItem, ...(isActive ? s.convActive : {}) }}
                      onClick={() => openConversation(other?._id, other)}
                    >
                      <div style={s.convAvatar}>{other?.name?.charAt(0)}</div>
                      <div style={s.convInfo}>
                        <p style={s.convName}>{other?.name}</p>
                        <p style={s.convPreview}>{conv.text?.substring(0, 32)}...</p>
                      </div>
                      {!conv.isRead && conv.receiver?._id === user._id && <div style={s.unreadDot} />}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Chat Area */}
          {(!isMobile || showChat) && (
            <div style={s.chatBox(isMobile)}>
              {!activeConv ? (
                <div style={s.noChat}>
                  <div style={s.noChatEmoji}>💬</div>
                  <h3 style={s.noChatTitle}>Select a conversation</h3>
                  <p style={s.noChatText}>Or click "Message Owner" from any item page</p>
                </div>
              ) : (
                <>
                  {/* Mobile Back Button */}
                  {isMobile && (
                    <button onClick={closeChat} style={s.mobileBackBtn}>
                      ← Back to Inbox
                    </button>
                  )}

                  <div style={s.chatHeader}>
                    <div style={s.chatAvatar}>{otherUser?.name?.charAt(0)}</div>
                    <div>
                      <p style={s.chatName}>{otherUser?.name}</p>
                      <p style={s.chatUni}>{otherUser?.university || 'Student'}</p>
                    </div>
                  </div>

                  <div style={s.messages}>
                    {messages.length === 0 ? (
                      <div style={s.noMessages}>
                        <p style={{ fontSize: 32, marginBottom: 8 }}>👋</p>
                        <p style={{ color: '#9CA3AF' }}>Say hello!</p>
                      </div>
                    ) : (
                      messages.map(msg => {
                        const isMine = msg.sender._id === user._id;
                        return (
                          <div key={msg._id} style={{ ...s.msgRow, justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                            {!isMine && <div style={s.msgAvatar}>{msg.sender.name?.charAt(0)}</div>}
                            <div style={{ ...s.bubble, ...(isMine ? s.myBubble : s.theirBubble) }}>
                              {msg.relatedItem && <div style={s.itemRef}>📦 Re: {msg.relatedItem.title}</div>}
                              <p style={s.msgText}>{msg.text}</p>
                              <p style={s.msgTime}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={bottomRef} />
                  </div>

                  <form onSubmit={handleSend} style={s.inputRow}>
                    <input
                      style={s.inputField}
                      type="text"
                      placeholder="Type a message..."
                      value={text}
                      onChange={e => setText(e.target.value)}
                    />
                    <button
                      style={{ ...s.sendBtn, ...(!text.trim() || loading ? s.sendDisabled : {}) }}
                      type="submit"
                      disabled={loading || !text.trim()}
                    >
                      Send ➤
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
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
    padding: isMobile ? '20px 16px' : '36px 24px'
  }),

  header: { marginBottom: 24 },
  title: { fontSize: 30, fontWeight: 800, color: '#1B1B1B', fontFamily: 'Poppins, sans-serif' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },

  layout: (isMobile) => ({
    display: isMobile ? 'block' : 'grid',
    gridTemplateColumns: '290px 1fr',
    gap: 20,
    height: isMobile ? 'auto' : '72vh'
  }),

  inbox: (isMobile) => ({
    background: '#fff',
    border: '1px solid #E2EFE6',
    borderRadius: 14,
    padding: 16,
    overflowY: 'auto',
    boxShadow: '0 2px 8px rgba(46,125,50,0.06)',
    height: isMobile ? 'auto' : '100%',
    maxHeight: isMobile ? 'none' : '72vh'
  }),

  inboxLabel: { fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 14, paddingLeft: 4 },
  emptyInbox: { textAlign: 'center', padding: '40px 10px' },

  convItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 10px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', marginBottom: 4 },
  convActive: { background: '#E8F5E9', border: '1px solid #A5D6A7' },
  convAvatar: { width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #2E7D32, #66BB6A)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 },
  convInfo: { flex: 1, minWidth: 0 },
  convName: { fontWeight: 600, fontSize: 14, color: '#1B1B1B', marginBottom: 2 },
  convPreview: { fontSize: 12, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  unreadDot: { width: 8, height: 8, borderRadius: '50%', background: '#2E7D32', flexShrink: 0 },

  chatBox: (isMobile) => ({
    background: '#fff',
    border: '1px solid #E2EFE6',
    borderRadius: 14,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(46,125,50,0.06)',
    height: isMobile ? 'calc(100vh - 180px)' : '100%'
  }),

  mobileBackBtn: {
    padding: '10px 16px',
    background: '#F1F8F4',
    border: 'none',
    color: '#2E7D32',
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    borderBottom: '1px solid #E2EFE6'
  },

  noChat: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' },
  noChatEmoji: { fontSize: 48, marginBottom: 14 },
  noChatTitle: { fontSize: 18, fontWeight: 700, color: '#1B1B1B', marginBottom: 8 },
  noChatText: { fontSize: 14, color: '#9CA3AF' },

  chatHeader: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid #F1F8F4', background: '#FAFDFB' },
  chatAvatar: { width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #2E7D32, #66BB6A)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 },
  chatName: { fontWeight: 700, color: '#1B1B1B', fontSize: 15 },
  chatUni: { fontSize: 12, color: '#9CA3AF' },

  messages: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 },
  noMessages: { textAlign: 'center', margin: 'auto', color: '#9CA3AF' },

  msgRow: { display: 'flex', alignItems: 'flex-end', gap: 8 },
  msgAvatar: { width: 28, height: 28, borderRadius: '50%', background: '#A5D6A7', color: '#1B5E20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 },
  bubble: { maxWidth: '72%', padding: '10px 14px', borderRadius: 16, wordBreak: 'break-word' },
  myBubble: { background: '#2E7D32', color: '#fff', borderBottomRightRadius: 4 },
  theirBubble: { background: '#F1F8F4', border: '1px solid #E2EFE6', color: '#1B1B1B', borderBottomLeftRadius: 4 },
  itemRef: { fontSize: 11, opacity: 0.75, marginBottom: 5, fontStyle: 'italic' },
  msgText: { fontSize: 14, lineHeight: 1.5 },
  msgTime: { fontSize: 10, opacity: 0.65, marginTop: 4, textAlign: 'right' },

  inputRow: { display: 'flex', gap: 10, padding: '14px 20px', borderTop: '1px solid #F1F8F4' },
  inputField: { flex: 1, padding: '12px 18px', background: '#F9FBF9', border: '1.5px solid #E2EFE6', borderRadius: 50, color: '#1B1B1B', fontSize: 15 },
  sendBtn: { padding: '12px 24px', background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 50, fontWeight: 600, cursor: 'pointer', fontSize: 14, boxShadow: '0 2px 8px rgba(46,125,50,0.2)' },
  sendDisabled: { opacity: 0.5, cursor: 'not-allowed' },
};