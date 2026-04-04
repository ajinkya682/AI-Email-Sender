import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

export const useChatStore = create((set, get) => ({
  conversations: [],
  messages: [],
  activeConversationId: null,
  isLoading: false,
  deletingId: null, // tracks which conversation is pending delete confirm

  fetchConversations: async () => {
    try {
      const res = await axios.get(`${API_URL}/chat/conversations`, getAuthHeaders());
      set({ conversations: res.data.data });
    } catch (err) {
      console.error(err);
    }
  },

  fetchMessages: async (conversationId) => {
    set({ isLoading: true });
    try {
      const res = await axios.get(`${API_URL}/chat/conversations/${conversationId}`, getAuthHeaders());
      set({ messages: res.data.data, activeConversationId: conversationId, isLoading: false });
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },

  sendMessage: async (content) => {
    const { activeConversationId, messages } = get();
    
    // Optimistic UI updates
    const tempUserMsg = { _id: Date.now(), role: 'user', content };
    const tempLoadingMsg = { _id: Date.now() + 1, role: 'assistant', loading: true };
    
    set({ messages: [...messages, tempUserMsg, tempLoadingMsg] });

    try {
      const payload = { content };
      if (activeConversationId) {
        payload.conversationId = activeConversationId;
      }

      const res = await axios.post(`${API_URL}/chat`, payload, getAuthHeaders());
      
      const { userMessage, aiMessage, conversationId } = res.data.data;

      // Ensure active conversation aligns
      set((state) => ({
        activeConversationId: conversationId,
        messages: state.messages
          .map(m => m.loading ? aiMessage : m)
          .map(m => m._id === tempUserMsg._id ? userMessage : m)
      }));
      
      // Update conversations list if it's new
      if (!activeConversationId) {
        get().fetchConversations();
      }
      
    } catch (err) {
      console.error(err);
      // Remove loaders if error
      set((state) => ({
        messages: state.messages.filter(m => !m.loading)
      }));
    }
  },

  deleteConversation: async (id) => {
    try {
      await axios.delete(`${API_URL}/chat/conversations/${id}`, getAuthHeaders());
      set((state) => {
        const wasActive = state.activeConversationId === id;
        return {
          conversations: state.conversations.filter(c => c._id !== id),
          activeConversationId: wasActive ? null : state.activeConversationId,
          messages: wasActive ? [] : state.messages,
          deletingId: null,
        };
      });
    } catch (err) {
      console.error(err);
      set({ deletingId: null });
    }
  },

  setDeletingId: (id) => set({ deletingId: id }),

  clearActiveConversation: () => set({ activeConversationId: null, messages: [] })
}));
