import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout = ({ chats, activeChat, onSelectChat, onNewChat, children }) => {
  return (
    <div className="vh-100 d-flex flex-column bg-light">
      <Header /> {/* Removed user prop */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        <Sidebar 
          chats={chats}
          activeChat={activeChat}
          onSelectChat={onSelectChat}
          onNewChat={onNewChat}
        />
        <div className="flex-grow-1 d-flex flex-column" style={{ backgroundColor: '#cbd5e1' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;