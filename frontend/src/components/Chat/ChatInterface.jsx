import React from 'react';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';

const ChatInterface = ({ messages, onSendMessage, disabled }) => {
  return (
    <div className="d-flex flex-column flex-grow-1">
      <div className="flex-grow-1 overflow-auto p-4">
        <ChatHistory messages={messages} />
      </div>
      <ChatInput onSend={onSendMessage} disabled={disabled} />
    </div>
  );
};

export default ChatInterface;