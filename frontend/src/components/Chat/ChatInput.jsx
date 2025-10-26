import React, { useState } from 'react';
import { Send } from 'lucide-react';
import Button from '../UI/Button';

const ChatInput = ({ onSend, disabled, uploadedFile, placeholder }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const handleSend = async () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage || disabled || isSending) {
      return;
    }
    
    setIsSending(true);
    
    try {
      await onSend(trimmedMessage);
      setMessage(''); // Clear input after successful send
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Determine placeholder text
  const placeholderText = placeholder || 
    (!uploadedFile 
      ? "Please upload a document first..." 
      : "Ask a question about your document..."
    );
  
  return (
    <div className="bg-white border-top p-3">
      <div className="d-flex gap-2 align-items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholderText}
          disabled={disabled || isSending}
          className="form-control"
          style={{
            backgroundColor: disabled ? '#f8f9fa' : 'white',
            cursor: disabled ? 'not-allowed' : 'text'
          }}
        />
        <Button 
          variant="primary" 
          size="md" 
          onClick={handleSend}
          disabled={disabled || !message.trim() || isSending}
          className="text-nowrap"
        >
          {isSending ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Sending
            </>
          ) : (
            <>
              Send
              <Send size={18} />
            </>
          )}
        </Button>
      </div>
      
      {disabled && !uploadedFile && (
        <div className="mt-2">
          <small className="text-muted">
            Upload a document to start chatting
          </small>
        </div>
      )}
    </div>
  );
};

export default ChatInput;