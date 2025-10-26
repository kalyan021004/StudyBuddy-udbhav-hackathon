import React, { useState } from 'react';
import { Upload, FileText, Check, X } from 'lucide-react';
import Button from '../UI/Button';

const FileDropZone = ({ onFileSelect, uploadedFile }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  };
  
  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const uploadFile = async (file) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF or DOCX file');
      return;
    }

    // Validate file size (e.g., max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);

      // UPDATE THIS URL TO YOUR BACKEND API
      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Call parent callback with file info including ID from backend
      onFileSelect({
        id: data.fileId || data.id,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        ...data // Include any other data from backend
      });

    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    setError('');
  };
  
  if (uploadedFile) {
    return (
      <div className="bg-white rounded shadow-sm p-3 d-flex align-items-center gap-3 position-relative">
        <FileText className="text-secondary" size={24} />
        <div className="flex-grow-1">
          <div className="fw-medium">{uploadedFile.name}</div>
          <div className="small text-success d-flex align-items-center gap-1">
            <Check size={14} />
            Ready to Chat
          </div>
        </div>
        <button 
          onClick={handleRemoveFile}
          className="btn btn-sm btn-outline-danger"
          title="Remove file"
        >
          <X size={16} />
        </button>
      </div>
    );
  }
  
  return (
    <div>
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
          ></button>
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border border-2 border-dashed rounded p-5 text-center ${
          isDragging ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'
        }`}
        style={{ transition: 'all 0.2s' }}
      >
        {uploading ? (
          <div className="py-4">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Uploading...</span>
            </div>
            <p className="text-secondary mb-0">Uploading your file...</p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto mb-3 text-secondary" size={32} />
            <p className="text-secondary mb-3">Drag & Drop your File (PDF, DOCX) here</p>
            <input
              type="file"
              id="file-input"
              className="d-none"
              accept=".pdf,.docx,.doc"
              onChange={handleFileInput}
            />
            <Button 
              variant="primary" 
              size="md" 
              onClick={() => document.getElementById('file-input').click()}
              disabled={uploading}
            >
              Browse Files
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default FileDropZone;