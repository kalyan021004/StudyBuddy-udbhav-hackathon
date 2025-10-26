import React, { useState } from 'react';
import { Send } from 'lucide-react';
import Button from '../UI/Button';

const ChatInput = ({ onSend, uploadedFile, placeholder }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  
  const handleSend = async () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage || isSending) {
      return;
    }
    
    setIsSending(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('https://studybuddy-udbhav-hackathon.onrender.com/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: trimmedMessage,
          fileId: uploadedFile?.id, // Include the uploaded file ID
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Call parent callback with the message and response
      await onSend(trimmedMessage, data);
      setMessage(''); // Clear input after successful send
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
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
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-2" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close btn-close-sm" 
            onClick={() => setError('')}
          ></button>
        </div>
      )}
      
      <div className="d-flex gap-2 align-items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholderText}
          disabled={isSending}
          className="form-control"
        />
        <Button 
          variant="primary" 
          size="md" 
          onClick={handleSend}
          disabled={!message.trim() || isSending}
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
              <Send size={18} className="ms-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;