import { useState, useRef, useEffect } from 'react';
import { Send, Mail, MessageCircle, Bot, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import MessageBubble from './MessageBubble';

/* ─── Capability Feature Badges ─── */
const CAPABILITY_BADGES = [
  { icon: <Bot size={13} />, label: 'Chat AI', color: '#7C3AED' },
  { icon: <Mail size={13} />, label: 'Send Email', color: '#FF6A00' },
  { icon: <MessageCircle size={13} />, label: 'WhatsApp', color: '#22C55E' },
];

/* ─── Suggestion Chips ─── */
const SUGGESTION_CHIPS = [
  {
    icon: <Mail size={14} />,
    text: 'Send an email to john@example.com about our Q1 results',
    color: '#FF6A00',
  },
  {
    icon: <MessageCircle size={14} />,
    text: 'Send a WhatsApp message to +1234567890 confirming our meeting',
    color: '#22C55E',
  },
  {
    icon: <Bot size={14} />,
    text: 'Research and email me the latest AI trends from the web',
    color: '#7C3AED',
  },
  {
    icon: <Zap size={14} />,
    text: 'Draft a professional follow-up email for a job interview',
    color: '#FF6A00',
  },
];

const ChatArea = () => {
  const [input, setInput] = useState('');
  const { messages, sendMessage, isLoading, activeConversationId, conversations } =
    useChatStore();
  const messagesEndRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const textareaRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const activeConversation = conversations.find((c) => c._id === activeConversationId);

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

  useEffect(() => {
    if (messagesAreaRef.current) {
      messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight;
    }
  }, [activeConversationId]);

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
            {messages.filter((m) => !m.loading).length} messages
          </span>
        </div>
      )}

      {/* Messages or Empty State */}
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-inner">

            {/* Capability badges */}
            <div className="capability-badges">
              {CAPABILITY_BADGES.map((badge) => (
                <div
                  key={badge.label}
                  className="capability-badge"
                  style={{ '--badge-color': badge.color }}
                >
                  <span className="capability-badge-icon">{badge.icon}</span>
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>

            {/* Icon + Title */}
            <div className="mail-icon-bg">
              <Sparkles size={30} />
            </div>
            <h2 className="empty-title">I'm OmniPilot AI. What can I do for you today?</h2>
            <p className="empty-subtitle">
              Ask anything, send emails, or dispatch WhatsApp messages — all by just chatting.
            </p>

            {/* Suggestion Chips */}
            <div className="suggestion-chips">
              {SUGGESTION_CHIPS.map((chip, i) => (
                <button
                  key={i}
                  className="suggestion-chip"
                  onClick={() => handleChipClick(chip.text)}
                  style={{ '--chip-color': chip.color }}
                >
                  <span className="chip-icon" style={{ color: chip.color }}>
                    {chip.icon}
                  </span>
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
            placeholder="Ask anything, send an email, or message via WhatsApp…"
            rows={1}
            className="chat-input"
            id="chat-input-textarea"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="send-btn"
            id="chat-send-btn"
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
