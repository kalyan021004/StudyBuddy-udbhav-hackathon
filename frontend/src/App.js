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
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  
  // Backend API base URL - UPDATE THIS TO YOUR BACKEND URL
  const API_BASE_URL = 'http://localhost:3000/api';
  
  // Load all chats from backend when component mounts
  useEffect(() => {
    loadAllChats();
  }, []);
  
  // Load chat history when active chat changes
  useEffect(() => {
    if (activeChat) {
      loadChatHistory(activeChat);
    } else {
      setMessages([]);
      setUploadedFile(null);
    }
  }, [activeChat]);

  // Function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  };

  // Function to load all chats from backend
  const loadAllChats = async () => {
    setIsLoadingChats(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
        
        // Set first chat as active if available and no active chat selected
        if (!activeChat && data.chats && data.chats.length > 0) {
          setActiveChat(data.chats[0].id);
        }
      } else {
        console.error('Failed to load chats');
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  // Function to load chat history from backend
  const loadChatHistory = async (chatId) => {
    setIsLoadingChat(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        
        if (data.file) {
          setUploadedFile({
            id: data.file.id || data.file._id,
            name: data.file.name || data.file.filename,
            url: data.file.url || data.file.path
          });
        } else {
          setUploadedFile(null);
        }
      } else {
        console.error('Failed to load chat history');
        setMessages([]);
        setUploadedFile(null);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setMessages([]);
      setUploadedFile(null);
    } finally {
      setIsLoadingChat(false);
    }
  };
  
  // Handle file upload - Save to backend
  const handleFileSelect = async (file) => {
    setIsUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // If there's an active chat, include it
      if (activeChat) {
        formData.append('chatId', activeChat);
      }
      
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
        id: data.fileId || data.file?.id,
        name: file.name,
        url: data.fileUrl || data.file?.url
      });
      
      // Clear messages for new file
      setMessages([]);
      
      // Create new chat or update existing chat with file
      if (activeChat) {
        // Update existing chat with new file
        await updateChatTitle(activeChat, file.name.replace(/\.[^/.]+$/, ""));
        await loadChatHistory(activeChat);
      } else {
        // Create new chat with file name
        const newChatId = await createNewChat(file.name.replace(/\.[^/.]+$/, ""));
        if (newChatId) {
          // Upload file again with new chatId
          const formData2 = new FormData();
          formData2.append('file', file);
          formData2.append('chatId', newChatId);
          
          await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData2,
          });
        }
      }
      
      // Reload chats to get updated list
      await loadAllChats();
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Failed to upload file: ${error.message}`);
    } finally {
      setIsUploadingFile(false);
    }
  };
  
  // Create new chat on backend
  const createNewChat = async (title = 'New Chat') => {
    try {
      const response = await fetch(`${API_BASE_URL}/chats`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (response.ok) {
        const data = await response.json();
        const newChatId = data.chatId || data.chat?.id || data.id;
        
        await loadAllChats(); // Reload all chats
        setActiveChat(newChatId);
        setMessages([]);
        setUploadedFile(null);
        
        return newChatId;
      } else {
        throw new Error('Failed to create chat');
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
      alert('Failed to create new chat');
      return null;
    }
  };

  // Update chat title
  const updateChatTitle = async (chatId, title) => {
    try {
      await fetch(`${API_BASE_URL}/chats/${chatId}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
      
      // Update local state
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, title } : chat
      ));
    } catch (error) {
      console.error('Error updating chat title:', error);
    }
  };
  
  // Handle sending messages to backend
  const handleSendMessage = async (text) => {
    // Check if file is uploaded
    if (!uploadedFile) {
      // Don't send message, ChatInput component will show disabled state
      return;
    }

    // Trim the message
    const trimmedText = text.trim();
    if (!trimmedText) {
      return;
    }

    // Add user message immediately to UI
    const userMessage = {
      id: `temp-${Date.now()}`,
      text: trimmedText,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          fileId: uploadedFile.id,
          chatId: activeChat,
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
        text: data.response || data.message || 'No response received',
        source: data.source || data.page || null,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Reload chat history to sync with backend
      if (activeChat) {
        setTimeout(() => loadChatHistory(activeChat), 500);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };
  
  // Handle creating new chat
  const handleNewChat = async () => {
    await createNewChat();
  };

  // Handle selecting a chat from sidebar
  const handleSelectChat = (chatId) => {
    setActiveChat(chatId);
  };

  // Handle deleting a chat
  const handleDeleteChat = async (chatId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this chat?');
    if (!confirmDelete) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }

      // Remove from local state
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      // If deleted chat was active, switch to first available chat
      if (activeChat === chatId) {
        const remainingChats = chats.filter(chat => chat.id !== chatId);
        if (remainingChats.length > 0) {
          setActiveChat(remainingChats[0].id);
        } else {
          setActiveChat(null);
          setMessages([]);
          setUploadedFile(null);
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat');
    }
  };
  
  // Show loading state while fetching chats
  if (isLoadingChats) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading chats...</span>
        </div>
      </div>
    );
  }
  
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
                  <div className="spinner-border text-primary mb-3" role="status">
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
        
        {isLoadingChat ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading chat...</span>
            </div>
          </div>
        ) : (
          messages.length > 0 && <ChatHistory messages={messages} />
        )}
        
        {!uploadedFile && !isLoadingChat && chats.length === 0 && (
          <div className="text-center py-5">
            <p className="text-secondary">Create a new chat and upload a document to get started!</p>
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