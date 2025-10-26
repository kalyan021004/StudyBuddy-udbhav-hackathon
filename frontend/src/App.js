import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import FileDropZone from './components/FileUpload/FileDropZone';
import FilePreview from './components/FileUpload/FilePreview';
import ChatHistory from './components/Chat/ChatHistory';
import ChatInput from './components/Chat/ChatInput';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

// Main Dashboard Component
function Dashboard() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  
  // Backend API base URL
  const API_BASE_URL = 'https://studybuddy-udbhav-hackathon.onrender.com/api';
  
  // Function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  };

  // Handle file upload - Save to backend
  const handleFileSelect = async (file) => {
    setIsUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'File upload failed');
      }

      const data = await response.json();
      
      // Set uploaded file
      setUploadedFile({
        id: data.fileId || data.file?.id || data.id,
        name: file.name,
        url: data.fileUrl || data.file?.url
      });
      
      // Create new chat when file is uploaded
      if (!activeChat) {
        const chatTitle = file.name.replace(/\.[^/.]+$/, "");
        await createNewChat(chatTitle);
      }
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Failed to upload file: ${error.message}`);
    } finally {
      setIsUploadingFile(false);
    }
  };
  
  // Create new chat
  const createNewChat = async (title = 'New Chat') => {
    const newChat = {
      id: `chat-${Date.now()}`,
      title: title,
      messages: [],
      createdAt: new Date().toISOString()
    };
    
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat.id);
    setMessages([]);
  };
  
  // Handle sending messages to backend
  const handleSendMessage = async (text) => {
    // Check if file is uploaded
    if (!uploadedFile) {
      return;
    }

    // Trim the message
    const trimmedText = text.trim();
    if (!trimmedText) {
      return;
    }

    // Add user message immediately to UI
    const userMessage = {
      id: `user-${Date.now()}`,
      text: trimmedText,
      isUser: true,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: trimmedText,
          fileId: uploadedFile.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get response from server');
      }

      const data = await response.json();
      
      // Add AI response to messages
      const aiMessage = {
        id: `ai-${Date.now()}`,
        text: data.answer || data.response || data.message || 'No response received',
        source: data.source || data.page || null,
        isUser: false,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update chat in the list
      setChats(prev => prev.map(chat => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: [...messages, userMessage, aiMessage],
            // Update title with first question if still "New Chat"
            title: chat.messages.length === 0 ? trimmedText.substring(0, 50) + '...' : chat.title
          };
        }
        return chat;
      }));
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        isUser: false,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };
  
  // Handle creating new chat
  const handleNewChat = async () => {
    await createNewChat();
    setUploadedFile(null); // Clear uploaded file for new chat
  };

  // Handle selecting a chat from sidebar
  const handleSelectChat = (chatId) => {
    const selectedChat = chats.find(chat => chat.id === chatId);
    if (selectedChat) {
      setActiveChat(chatId);
      setMessages(selectedChat.messages || []);
    }
  };

  // Handle deleting a chat
  const handleDeleteChat = async (chatId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this chat?');
    if (!confirmDelete) return;
    
    // Remove from local state
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    
    // If deleted chat was active, switch to first available chat
    if (activeChat === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      if (remainingChats.length > 0) {
        setActiveChat(remainingChats[0].id);
        setMessages(remainingChats[0].messages || []);
      } else {
        setActiveChat(null);
        setMessages([]);
        setUploadedFile(null);
      }
    }
  };
  
  return (
    <MainLayout
      chats={chats}
      activeChat={activeChat}
      onSelectChat={handleSelectChat}
      onNewChat={handleNewChat}
      onDeleteChat={handleDeleteChat}
    >
      <div className="flex-grow-1 overflow-auto p-4">
        <div className="rounded p-4 mb-4" style={{ backgroundColor: '#94a3b8' }}>
          <h2 className="h4 fw-semibold text-white mb-4">Document Upload</h2>
          
          <div className="row g-3">
            <div className="col-md-8">
              {isUploadingFile ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-light mb-3" role="status">
                    <span className="visually-hidden">Uploading...</span>
                  </div>
                  <p className="text-white">Uploading file...</p>
                </div>
              ) : (
                <FileDropZone 
                  onFileSelect={handleFileSelect}
                  uploadedFile={uploadedFile}
                />
              )}
            </div>
            <div className="col-md-4">
              <FilePreview file={uploadedFile} />
            </div>
          </div>
        </div>
        
        {messages.length > 0 ? (
          <ChatHistory messages={messages} />
        ) : (
          <div className="text-center py-5">
            <p className="text-secondary">
              {!uploadedFile 
                ? "Upload a document to start chatting!" 
                : "Ask a question about your document"}
            </p>
          </div>
        )}
      </div>
      
      <ChatInput 
        onSend={handleSendMessage}
        disabled={!uploadedFile || isUploadingFile}
        uploadedFile={uploadedFile}
        placeholder={
          !uploadedFile 
            ? "Please upload a document first..." 
            : isUploadingFile 
            ? "Uploading file..." 
            : "Ask a question about your document..."
        }
      />
    </MainLayout>
  );
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
                <Dashboard />
            } 
          />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;