import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, CheckCircle, XCircle, Copy, Check } from 'lucide-react';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (message.loading) {
    return (
      <div className="message-row assistant">
        <div className="avatar-col">
          <div className="ai-avatar">
            <Sparkles size={13} />
          </div>
        </div>
        <div className="message-content ai-bubble">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
      {!isUser && (
        <div className="avatar-col">
          <div className="ai-avatar">
            <Sparkles size={13} />
          </div>
        </div>
      )}

      <div className={`message-content ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>

        {/* Email status badge */}
        {message.metadata?.intent === 'SEND_EMAIL' && message.metadata?.emailStatus && (
          <div className={`metadata-badge ${message.metadata.emailStatus}`}>
            {message.metadata.emailStatus === 'sent' ? (
              <><CheckCircle size={13} /> Email Sent Successfully</>
            ) : (
              <><XCircle size={13} /> Failed to Send Email</>
            )}
          </div>
        )}

        {/* Timestamp + copy */}
        <div className="bubble-meta">
          <span className="bubble-time">{formatTime(message.createdAt)}</span>
          {!isUser && (
            <button className="copy-btn" onClick={handleCopy} title="Copy response">
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
