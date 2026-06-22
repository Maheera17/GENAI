import { useState } from 'react';

function ChatInput({ onSend, isLoading, disabled }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading || disabled) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="chat-input glass-card" onSubmit={handleSubmit}>
      <div className="chat-input__wrapper">
        <textarea
          className="chat-input__field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about the document..."
          rows={2}
          disabled={isLoading || disabled}
          aria-label="Message input"
        />
        <button
          type="submit"
          className="chat-input__send"
          disabled={!input.trim() || isLoading || disabled}
          aria-label="Send message"
        >
          {isLoading ? (
            <span className="spinner" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}

export default ChatInput;
