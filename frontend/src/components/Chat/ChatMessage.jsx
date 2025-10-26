import React from 'react';
import { User } from 'lucide-react';

const ChatMessage = ({ message, isUser }) => {
  return (
    <div className={`d-flex gap-3 mb-3 ${isUser ? 'justify-content-start' : 'justify-content-end'}`}>
      {isUser && (
        <div className="bg-secondary bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" 
             style={{ width: '32px', height: '32px' }}>
          <User size={16} className="text-secondary" />
        </div>
      )}
      <div 
        className={`rounded px-3 py-2 ${isUser ? 'bg-light text-dark' : 'bg-primary text-white'}`}
        style={{ maxWidth: '70%' }}
      >
        <p className="small mb-0" style={{ lineHeight: '1.5' }}>{message.text}</p>
        {message.source && (
          <p className="small mb-0 mt-1 opacity-75">(Source: {message.source})</p>
        )}
      </div>
      {!isUser && (
        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" 
             style={{ width: '32px', height: '32px' }}>
          <span className="text-white" style={{ fontSize: '12px', fontWeight: 'bold' }}>AI</span>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;