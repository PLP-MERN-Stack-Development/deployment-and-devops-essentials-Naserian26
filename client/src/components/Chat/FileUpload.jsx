import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiX, FiUpload } from 'react-icons/fi';
import fileService from '../../services/fileService';
import LoadingSpinner from '../UI/LoadingSpinner';

const FileUpload = ({ onFileUpload, onCancel }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const result = await fileService.uploadFile(file);
      onFileUpload(result);
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onFileUpload]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });
  
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Upload File</h3>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <FiX />
        </button>
      </div>
      
      {uploading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <LoadingSpinner size="md" />
          <p className="mt-2 text-sm text-gray-600">Uploading...</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <FiUpload className="mx-auto text-gray-400 text-2xl mb-2" />
          {isDragActive ? (
            <p className="text-sm text-gray-600">Drop the file here...</p>
          ) : (
            <div>
              <p className="text-sm text-gray-600">Drag & drop a file here, or click to select</p>
              <p className="text-xs text-gray-500 mt-1">Max file size: 10MB</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
