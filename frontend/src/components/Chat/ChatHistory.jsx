import React from 'react';
import { User, Bot } from 'lucide-react';

const ChatHistory = ({ messages }) => {
  return (
    <div className="d-flex flex-column gap-3">
      {messages.map((message) => (
        <div 
          key={message.id}
          className={`d-flex gap-3 ${message.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
        >
          {message.sender === 'ai' && (
            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                 style={{ width: '40px', height: '40px', flexShrink: 0 }}>
              <Bot size={20} />
            </div>
          )}
          
          <div 
            className={`p-3 rounded ${
              message.sender === 'user' 
                ? 'bg-primary text-white' 
                : 'bg-white border'
            }`}
            style={{ maxWidth: '70%' }}
          >
            <p className="mb-1">{message.text}</p>
            <small className={`${message.sender === 'user' ? 'text-white-50' : 'text-muted'}`}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </small>
          </div>
          
          {message.sender === 'user' && (
            <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" 
                 style={{ width: '40px', height: '40px', flexShrink: 0 }}>
              <User size={20} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;