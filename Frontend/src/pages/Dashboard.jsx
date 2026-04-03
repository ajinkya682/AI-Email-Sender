import { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import { useChatStore } from '../store/useChatStore';
import './Dashboard.scss';

const Dashboard = () => {
  const { fetchConversations, activeConversationId, fetchMessages, clearActiveConversation } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
  }, [activeConversationId, fetchMessages]);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <ChatArea />
      </main>
    </div>
  );
};

export default Dashboard;
