import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Avatar from '../UI/Avatar';
import Dropdown from '../UI/Dropdown';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated()) {
    return (
      <div className="bg-light border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
        <h1 className="h2 fw-bold mb-0">Chat History</h1>
        <div className="d-flex align-items-center gap-3">
          <a href="/login" className="btn btn-outline-primary">Login</a>
          <a href="/signup" className="btn btn-primary">Sign Up</a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
      <h1 className="h2 fw-bold mb-0">Chat History</h1>
      <div className="d-flex align-items-center gap-3 position-relative">
        <span className="small text-secondary">Welcome back!</span>
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="btn btn-light d-flex align-items-center gap-2"
        >
          <Avatar name={user?.name} image={user?.avatar} />
          <span className="fw-medium">{user?.name}</span>
          <ChevronDown size={16} className="text-secondary" />
        </button>
        <Dropdown isOpen={dropdownOpen} onClose={() => setDropdownOpen(false)} />
      </div>
    </div>
  );
};

export default Header;