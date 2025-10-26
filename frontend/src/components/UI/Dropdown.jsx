import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Dropdown = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
    // Optionally redirect to login page
    // window.location.href = '/login';
  };
  
  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1040
        }}
        onClick={onClose}
      />
      <div className="dropdown-menu show position-absolute" style={{ right: '1rem', top: '4rem', zIndex: 1050 }}>
        <button className="dropdown-item d-flex align-items-center gap-2">
          <User size={16} />
          Profile
        </button>
        <button 
          className="dropdown-item d-flex align-items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </>
  );
};

export default Dropdown;