import React from 'react';
import ChatMessage from './ChatMessage';

const ChatHistory = ({ messages }) => {
  return (
    <div className="rounded p-4" style={{ backgroundColor: '#94a3b8' }}>
      <h2 className="h4 fw-semibold text-white mb-3">Chat Interface</h2>
      <div className="rounded p-3" style={{ backgroundColor: '#cbd5e1', maxHeight: '400px', overflowY: 'auto' }}>
        {messages.length > 0 ? (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} isUser={message.isUser} />
          ))
        ) : (
          <div className="text-center text-secondary py-5">
            No messages yet. Start a conversation!
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;