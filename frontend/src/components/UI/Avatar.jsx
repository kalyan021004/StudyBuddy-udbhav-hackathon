import React from 'react';

const Avatar = ({ name, image, size = 'md' }) => {
  const sizeStyle = {
    sm: { width: '32px', height: '32px', fontSize: '14px' },
    md: { width: '40px', height: '40px', fontSize: '16px' },
    lg: { width: '48px', height: '48px', fontSize: '18px' }
  };

  const style = {
    ...sizeStyle[size],
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    overflow: 'hidden'
  };

  return (
    <div style={style}>
      {image ? (
        <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        name?.charAt(0).toUpperCase()
      )}
    </div>
  );
};

export default Avatar;