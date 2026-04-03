import { useState, useRef, useEffect } from 'react';
import { Send, Mail } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import MessageBubble from './MessageBubble';

const ChatArea = () => {
  const [input, setInput] = useState('');
  const { messages, sendMessage, isLoading } = useChatStore();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="chat-container">
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="mail-icon-bg">
            <Mail size={40} />
          </div>
          <h2>How can I help you today?</h2>
          <p>Ask a general question, or say something like "Send an email to john@example.com about our meeting tomorrow."</p>
        </div>
      ) : (
        <div className="messages-area">
          {messages.map((msg, idx) => (
            <MessageBubble key={msg._id || idx} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="input-area">
        <form onSubmit={handleSend} className="input-wrapper">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything or command me to send an email..."
            rows={1}
          />
          <button type="submit" disabled={!input.trim() || isLoading} className="send-btn">
            <Send size={18} />
          </button>
        </form>
        <div className="input-footer">
          <span>AI can make mistakes. Consider verifying important information.</span>
          <span className="tag">Pro Tip: "Draft an email to..."</span>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
