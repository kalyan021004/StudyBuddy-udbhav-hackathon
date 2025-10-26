import React from 'react';
import { FileText, File, FileCheck, X } from 'lucide-react';

const FilePreview = ({ file, onRemove }) => {
  if (!file) {
    return (
      <div className="bg-white rounded shadow p-3">
        <div className="bg-light rounded d-flex align-items-center justify-content-center overflow-hidden" 
             style={{ height: '256px' }}>
          <div className="text-center p-3">
            <File size={48} className="text-muted mx-auto mb-2" />
            <div className="small text-secondary">
              No document uploaded
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get file extension
  const getFileExtension = (filename) => {
    return filename?.split('.').pop()?.toLowerCase() || '';
  };

  const extension = getFileExtension(file.name);
  const isPdf = extension === 'pdf';
  const isDoc = ['doc', 'docx'].includes(extension);

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-white rounded shadow p-3 position-relative">
      {onRemove && (
        <button
          onClick={() => onRemove()}
          className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle"
          style={{ width: '30px', height: '30px', padding: '0' }}
          title="Remove file"
        >
          <X size={16} />
        </button>
      )}
      
      <div className="bg-light rounded d-flex align-items-center justify-content-center overflow-hidden mb-3" 
           style={{ height: '200px' }}>
        <div className="text-center p-3">
          {isPdf ? (
            <FileText size={64} className="text-danger mx-auto mb-2" />
          ) : isDoc ? (
            <FileText size={64} className="text-primary mx-auto mb-2" />
          ) : (
            <File size={64} className="text-secondary mx-auto mb-2" />
          )}
          
          <div className="badge bg-secondary text-uppercase mb-2">
            {extension}
          </div>
        </div>
      </div>

      <div className="border-top pt-2">
        <div className="d-flex align-items-start gap-2 mb-2">
          <FileCheck size={16} className="text-success mt-1 flex-shrink-0" />
          <div className="small text-truncate fw-medium" title={file.name}>
            {file.name}
          </div>
        </div>
        
        {file.size && (
          <div className="small text-muted">
            Size: {formatFileSize(file.size)}
          </div>
        )}
        
        {file.uploadedAt && (
          <div className="small text-muted">
            Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
          </div>
        )}
        
        <div className="mt-2">
          <span className="badge bg-success-subtle text-success w-100">
            Ready to Chat
          </span>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;