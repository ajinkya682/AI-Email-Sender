import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, CheckCircle, XCircle } from 'lucide-react';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  if (message.loading) {
    return (
      <div className="message-row assistant">
        <div className="avatar-col">
          <div className="ai-avatar">
            <Sparkles size={16} />
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
            <Sparkles size={16} />
          </div>
        </div>
      )}
      
      <div className={`message-content ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>

        {/* Display metadata badges for Email actions */}
        {message.metadata?.intent === 'SEND_EMAIL' && message.metadata?.emailStatus && (
          <div className={`metadata-badge ${message.metadata.emailStatus}`}>
            {message.metadata.emailStatus === "sent" ? (
              <>
                <CheckCircle size={14} /> Email Sent Successfully
              </>
            ) : (<><XCircle size={14} /> Failed to Send Email</>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
