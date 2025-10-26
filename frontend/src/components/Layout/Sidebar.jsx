import React from 'react';
import { Plus } from 'lucide-react';
import Button from '../UI/Button';

const Sidebar = ({ chats, activeChat, onSelectChat, onNewChat }) => {
  return (
    <div className="bg-light border-end d-flex flex-column" style={{ width: '256px' }}>
      <div className="p-3">
        <Button variant="primary" size="md" onClick={onNewChat} className="w-100">
          <Plus size={18} />
          New Chat
        </Button>
      </div>
      <div className="flex-grow-1 overflow-auto">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`btn btn-light w-100 text-start border-0 border-bottom rounded-0 py-3 ${
              activeChat === chat.id ? 'bg-primary bg-opacity-10' : ''
            }`}
          >
            <div className="small fw-medium text-truncate">{chat.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;