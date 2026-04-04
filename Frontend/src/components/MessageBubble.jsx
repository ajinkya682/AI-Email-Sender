import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, CheckCircle, XCircle, Copy, Check, MessageCircle } from 'lucide-react';

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

  /* ── Typing / Loading State ── */
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
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    );
  }

  /* ── Email status badge ── */
  const isEmailSent =
    message.metadata?.intent === 'SEND_EMAIL' && message.metadata?.emailStatus === 'sent';
  const isEmailFailed =
    message.metadata?.intent === 'SEND_EMAIL' && message.metadata?.emailStatus === 'failed';

  /* ── WhatsApp status badge ── */
  const isWhatsAppSent =
    message.metadata?.intent === 'SEND_WHATSAPP' && message.metadata?.whatsappStatus === 'sent';
  const isWhatsAppFailed =
    message.metadata?.intent === 'SEND_WHATSAPP' && message.metadata?.whatsappStatus === 'failed';

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
        {isEmailSent && (
          <div className="metadata-badge sent">
            <CheckCircle size={13} /> Email Sent Successfully
          </div>
        )}
        {isEmailFailed && (
          <div className="metadata-badge failed">
            <XCircle size={13} /> Failed to Send Email
          </div>
        )}

        {/* WhatsApp status badge */}
        {isWhatsAppSent && (
          <div className="metadata-badge whatsapp-sent">
            <MessageCircle size={13} /> WhatsApp Sent Successfully
          </div>
        )}
        {isWhatsAppFailed && (
          <div className="metadata-badge whatsapp-failed">
            <XCircle size={13} /> Failed to Send WhatsApp
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
