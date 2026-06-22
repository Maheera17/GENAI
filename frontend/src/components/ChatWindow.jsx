import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

function TypingIndicator() {
  return (
    <div className="message-row message-row--assistant">
      <div className="message-avatar message-avatar--assistant" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
          />
        </svg>
      </div>
      <div className="message-bubble message-bubble--assistant message-bubble--typing" aria-label="Assistant is typing">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

function ChatWindow({ messages, isTyping }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const messagesEl = containerRef.current?.querySelector('.chat-window__messages');
    if (messagesEl) {
      messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  return (
    <section className="chat-window glass-card" ref={containerRef} aria-live="polite">
      <div className="chat-window__messages">
        {messages.length === 0 && !isTyping && (
          <div className="chat-window__empty">
            <div className="chat-window__empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                />
              </svg>
            </div>
            <p className="chat-window__empty-title">Start a conversation</p>
            <p className="chat-window__empty-text">
              Upload a PDF, then ask anything about its content.
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <MessageBubble key={`${msg.role}-${index}`} role={msg.role} content={msg.content} />
        ))}

        {isTyping && <TypingIndicator />}
      </div>
    </section>
  );
}

export default ChatWindow;
