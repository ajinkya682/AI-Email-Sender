import { useState } from 'react';
import { MessageSquare, Plus, Sparkles, LogOut, Trash2, X, Check, Bot, Mail, MessageCircle } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';

/* ─── Capability Pills (shown below New Chat button) ─── */
const CAPABILITIES = [
  { icon: <Bot size={12} />, label: 'Chat AI', color: '#7C3AED' },
  { icon: <Mail size={12} />, label: 'Email', color: '#FF6A00' },
  { icon: <MessageCircle size={12} />, label: 'WhatsApp', color: '#22C55E' },
];

const Sidebar = () => {
  const {
    conversations,
    activeConversationId,
    clearActiveConversation,
    deleteConversation,
    deletingId,
    setDeletingId,
  } = useChatStore();
  const { user, logout } = useAuthStore();

  const handleSelectConv = (id) => {
    if (deletingId) return;
    useChatStore.setState({ activeConversationId: id });
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setDeletingId(null);
  };

  const handleConfirmDelete = (e, id) => {
    e.stopPropagation();
    deleteConversation(id);
  };

  /* ─── Group conversations by date ─── */
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const formatGroup = (dateStr) => {
    const date = new Date(dateStr);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const grouped = conversations.reduce((acc, conv) => {
    const label = formatGroup(conv.createdAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(conv);
    return acc;
  }, {});

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <Sparkles size={16} />
          </div>
          <span className="logo-text">AI Assistant</span>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="sidebar-actions">
        <button
          onClick={() => clearActiveConversation()}
          className="new-chat-btn"
          id="new-chat-btn"
        >
          <Plus size={16} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Capability Pills */}
      <div className="sidebar-capabilities">
        {CAPABILITIES.map((cap) => (
          <div
            key={cap.label}
            className="capability-pill"
            style={{ '--pill-color': cap.color }}
          >
            <span className="pill-icon">{cap.icon}</span>
            <span>{cap.label}</span>
          </div>
        ))}
      </div>

      {/* Conversations List */}
      <div className="conversations-list">
        {conversations.length === 0 ? (
          <div className="empty-conversations">
            <MessageSquare size={20} />
            <span>No conversations yet</span>
          </div>
        ) : (
          Object.entries(grouped).map(([label, convs]) => (
            <div key={label} className="conv-group">
              <span className="conv-group-label">{label}</span>
              {convs.map((conv) => (
                <div key={conv._id} className="conv-item-wrapper">
                  <button
                    onClick={() => handleSelectConv(conv._id)}
                    className={`conv-item ${activeConversationId === conv._id ? 'active' : ''} ${deletingId === conv._id ? 'deleting' : ''}`}
                  >
                    <MessageSquare size={14} className="conv-icon" />
                    <span className="conv-title">{conv.title}</span>

                    {deletingId === conv._id ? (
                      <div className="delete-confirm">
                        <button
                          className="confirm-btn confirm-yes"
                          onClick={(e) => handleConfirmDelete(e, conv._id)}
                          title="Confirm delete"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          className="confirm-btn confirm-no"
                          onClick={handleCancelDelete}
                          title="Cancel"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        className="delete-btn"
                        onClick={(e) => handleDeleteClick(e, conv._id)}
                        title="Delete conversation"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-info">
            <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button onClick={logout} className="logout-btn" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
