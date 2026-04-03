import { MessageSquare, Plus, Sparkles, LogOut } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';

const Sidebar = () => {
  const { conversations, activeConversationId, clearActiveConversation } = useChatStore();
  const { user, logout } = useAuthStore();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <Sparkles className="icon-sparkle" size={20} />
          <span>AI Assistant</span>
        </div>
      </div>

      <button onClick={() => clearActiveConversation()} className="new-chat-btn">
        <Plus size={18} />
        New Chat
      </button>

      <div className="conversations-list">
        {conversations.map((conv) => (
          <button
            key={conv._id}
            onClick={() => useChatStore.setState({ activeConversationId: conv._id })}
            className={`conv-item ${activeConversationId === conv._id ? 'active' : ''}`}
          >
            <MessageSquare size={16} />
            <span>{conv.title}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-info">
            <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <span>{user?.name}</span>
          </div>
          <button onClick={logout} className="logout-btn" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
