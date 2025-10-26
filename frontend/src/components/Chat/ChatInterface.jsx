import React, { useState } from 'react';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';

const ChatInterface = ({ uploadedFile }) => {
  const [messages, setMessages] = useState([]);

  const handleSendMessage = async (userMessage, apiResponse) => {
    // Add user message to chat
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      text: userMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    }]);
    
    // Add AI response to chat
    setMessages(prev => [...prev, {
      id: `ai-${Date.now()}`,
      text: apiResponse.answer || apiResponse.response || apiResponse.message || 'No response received',
      sender: 'ai',
      timestamp: new Date().toISOString()
    }]);
  };

  return (
    <div className="d-flex flex-column" style={{ height: '600px' }}>
      <div className="flex-grow-1 overflow-auto p-4 bg-light">
        {messages.length === 0 ? (
          <div className="text-center text-muted mt-5">
            <p>No messages yet. Start by asking a question about your document!</p>
          </div>
        ) : (
          <ChatHistory messages={messages} />
        )}
      </div>
      <ChatInput 
        onSend={handleSendMessage} 
        uploadedFile={uploadedFile}
      />
    </div>
  );
};

export default ChatInterface;