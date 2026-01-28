import React, { useCallback, useState, useId } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface FileUploadProps {
  onFileProcess: (file: File) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcess, isLoading, disabled = false }) => {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const uniqueId = useId(); // Generate a single, stable ID for the component instance

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const file = event.target.files?.[0];
    if (file) {
      onFileProcess(file);
    }
     event.target.value = ''; // Reset file input
  };

  const handleDrag = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    if (event.type === "dragenter" || event.type === "dragover") {
      setIsDragging(true);
    } else if (event.type === "dragleave") {
      setIsDragging(false);
    }
  }, [disabled]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onFileProcess(event.dataTransfer.files[0]);
    }
  }, [onFileProcess, disabled]);

  const isDisabled = isLoading || disabled;

  return (
    <div 
      className={`bg-white rounded-xl shadow-lg p-6 border-2 border-dashed transition-all duration-300 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300'} ${!isDisabled && 'hover:border-blue-400'} ${isDisabled ? 'bg-blue-50 cursor-not-allowed' : ''}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 ${isDragging ? 'text-blue-600' : isDisabled ? 'text-slate-300' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className={`text-center ${isDisabled ? 'text-slate-400' : 'text-slate-600'}`}>
          <label htmlFor={`file-upload-${uniqueId}`} className={`font-semibold ${isDisabled ? 'text-slate-400' : 'text-blue-600 hover:text-blue-800 cursor-pointer'}`}>
            {t('fileUpload.clickToUpload')}
          </label>
          <input id={`file-upload-${uniqueId}`} name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".xlsx, .xls" disabled={isDisabled}/>
          {' '}{t('fileUpload.dragAndDrop')}
        </p>
        <p className="text-xs text-slate-500">{t('fileUpload.fileTypes')}</p>
        {isLoading && <p className="text-sm text-blue-600 font-semibold mt-2">{t('fileUpload.processing')}</p>}
        {disabled && !isLoading && <p className="text-xs text-slate-500 mt-2">{t('fileUpload.disabled')}</p>}
      </div>
    </div>
  );
};

export default FileUpload;