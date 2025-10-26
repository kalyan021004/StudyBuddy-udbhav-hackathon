import React from 'react';
import { FileText } from 'lucide-react';

const FilePreview = ({ file }) => {
  return (
    <div className="bg-white rounded shadow p-3" style={{ width: '192px' }}>
      <div className="bg-light rounded d-flex align-items-center justify-content-center overflow-hidden mb-2" 
           style={{ height: '256px' }}>
        <div className="text-center p-3">
          <FileText size={48} className="text-danger mx-auto mb-2" />
          <div className="small text-secondary text-break">
            {file?.name || 'Document Preview'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;