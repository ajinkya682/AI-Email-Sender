import { useState, useRef, useEffect } from 'react';
import { Send, Mail, Zap, Globe, FileText, ArrowRight } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import MessageBubble from './MessageBubble';

const SUGGESTION_CHIPS = [
  { icon: <Mail size={14} />, text: 'Send an email to john@example.com about our Q1 results' },
  { icon: <Globe size={14} />, text: 'Research and email me about the latest AI trends' },
  { icon: <FileText size={14} />, text: 'Draft a professional follow-up email for a job interview' },
  { icon: <Zap size={14} />, text: 'What can you help me with?' },
];

const ChatArea = () => {
  const [input, setInput] = useState('');
  const { messages, sendMessage, isLoading, activeConversationId, conversations } = useChatStore();
  const messagesEndRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const textareaRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const activeConversation = conversations.find(c => c._id === activeConversationId);

  const scrollToBottom = (force = false) => {
    if (force || isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (!messagesAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesAreaRef.current;
    setIsNearBottom(scrollHeight - scrollTop - clientHeight < 120);
  };

  // Reset scroll when conversation changes
  useEffect(() => {
    if (messagesAreaRef.current) {
      messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight;
    }
  }, [activeConversationId]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleChipClick = (text) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  return (
    <div className="chat-container">
      {/* Conversation Header */}
      {activeConversationId && (
        <div className="chat-header">
          <span className="chat-header-title">
            {activeConversation?.title || 'Conversation'}
          </span>
          <span className="chat-header-badge">
            {messages.filter(m => !m.loading).length} messages
          </span>
        </div>
      )}

      {/* Messages or Empty State */}
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-inner">
            <div className="mail-icon-bg">
              <Mail size={32} />
            </div>
            <h2 className="empty-title">How can I help you today?</h2>
            <p className="empty-subtitle">
              Ask anything, or command me to research and send professional emails in seconds.
            </p>
            <div className="suggestion-chips">
              {SUGGESTION_CHIPS.map((chip, i) => (
                <button
                  key={i}
                  className="suggestion-chip"
                  onClick={() => handleChipClick(chip.text)}
                >
                  {chip.icon}
                  <span>{chip.text}</span>
                  <ArrowRight size={12} className="chip-arrow" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="messages-area"
          ref={messagesAreaRef}
          onScroll={handleScroll}
          key={activeConversationId}
        >
          {messages.map((msg, idx) => (
            <MessageBubble key={msg._id || idx} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area */}
      <div className="input-area">
        <form onSubmit={handleSend} className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything or say 'Send an email to...'"
            rows={1}
            className="chat-input"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="send-btn"
          >
            <Send size={16} />
          </button>
        </form>
        <div className="input-footer">
          <span>AI can make mistakes. Verify important information.</span>
          <span className="input-tip">Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
