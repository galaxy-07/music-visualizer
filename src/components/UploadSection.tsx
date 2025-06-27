
import React from 'react';
import { Upload } from 'lucide-react';
import FileUploader from '@/components/FileUploader';

interface UploadSectionProps {
  onFileUpload: (file: File) => void;
  isAnalyzing: boolean;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onFileUpload, isAnalyzing }) => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 w-full max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <Upload className="w-4 h-4 text-white" />
        <h3 className="text-sm font-display font-medium text-white">Upload Track</h3>
      </div>
      <FileUploader onFileUpload={onFileUpload} />
      
      {isAnalyzing && (
        <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-600/50">
          <div className="flex items-center gap-2 text-white text-sm">
            <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
            <span className="font-medium">Analyzing audio...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadSection;
