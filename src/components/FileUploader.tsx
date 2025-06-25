
import React, { useCallback, useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) {
        setUploadedFile(file);
        onFileUpload(file);
      }
    }
  }, [onFileUpload]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const removeFile = () => {
    setUploadedFile(null);
  };

  if (uploadedFile) {
    return (
      <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-600">
        <div className="flex items-center gap-3">
          <File className="w-5 h-5 text-blue-400" />
          <div>
            <div className="text-white font-medium">{uploadedFile.name}</div>
            <div className="text-slate-400 text-sm">
              {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={removeFile}
          className="text-slate-400 hover:text-white hover:bg-slate-700"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive
          ? 'border-blue-400 bg-blue-400/10'
          : 'border-slate-600 hover:border-slate-500'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        accept="audio/*"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      <div className="space-y-4">
        <div className="mx-auto w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
          <Upload className="w-8 h-8 text-slate-300" />
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-white mb-2">
            Upload your MP3 file
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            Drag and drop your audio file here, or click to browse
          </p>
          <Button variant="outline" className="bg-white/10 border-slate-600 text-white hover:bg-white/20">
            Choose File
          </Button>
        </div>
        
        <div className="text-xs text-slate-500">
          Supported formats: MP3, WAV, M4A (Max 50MB)
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
