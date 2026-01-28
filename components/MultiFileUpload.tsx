import React, { useCallback, useState, useId } from 'react';
import { FileStatus } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface MultiFileUploadProps {
  onFilesProcess: (files: File[]) => void;
  isLoading: boolean;
  statuses: Record<string, FileStatus>;
  fileConfig: Record<string, { labelKey: string; keyword: string }>;
  title: string;
  description: string;
}

const FileStatusIcon: React.FC<{ status: 'pending' | 'success' | 'error' }> = ({ status }) => {
    if (status === 'success') {
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
    }
    if (status === 'error') {
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
    }
    return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
};

const MultiFileUpload: React.FC<MultiFileUploadProps> = ({ onFilesProcess, isLoading, statuses, fileConfig, title, description }) => {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const uniqueId = useId();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading) return;
    const files = event.target.files;
    if (files && files.length > 0) {
      onFilesProcess(Array.from(files));
    }
    event.target.value = '';
  };

  const handleDrag = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (isLoading) return;
    if (event.type === "dragenter" || event.type === "dragover") {
      setIsDragging(true);
    } else if (event.type === "dragleave") {
      setIsDragging(false);
    }
  }, [isLoading]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (isLoading) return;
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      onFilesProcess(Array.from(event.dataTransfer.files));
    }
  }, [onFilesProcess, isLoading]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
        <div>
            <h3 className="font-semibold text-slate-600">{title}</h3>
            <p className="text-sm text-slate-500">{description}</p>
        </div>
      <div 
        className={`rounded-xl border-2 border-dashed transition-all duration-300 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300'} ${!isLoading && 'hover:border-blue-400'} ${isLoading ? 'bg-slate-50 cursor-not-allowed' : ''}`}
        onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4 p-6">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 ${isDragging ? 'text-blue-600' : isLoading ? 'text-slate-300' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className={`text-center ${isLoading ? 'text-slate-400' : 'text-slate-600'}`}>
            <label htmlFor={`multi-file-upload-${uniqueId}`} className={`font-semibold ${isLoading ? 'text-slate-400' : 'text-blue-600 hover:text-blue-800 cursor-pointer'}`}>
              {t('fileUpload.clickToUpload')}
            </label>
            <input id={`multi-file-upload-${uniqueId}`} name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".xlsx, .xls" disabled={isLoading} multiple/>
            {' '}{t('fileUpload.dragAndDrop')}
          </p>
          <p className="text-xs text-slate-500">{t('fileUpload.fileTypes')}</p>
          {isLoading && <p className="text-sm text-blue-600 font-semibold mt-2">{t('fileUpload.processing')}</p>}
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <h4 className="text-sm font-semibold text-slate-600">{t('fileUpload.statusTitle')}</h4>
        <ul className="space-y-1.5">
            {Object.entries(fileConfig).map(([key, config]) => {
                const status = statuses[key];
                if (!status) return null;
                return (
                    <li key={key} className="flex items-start space-x-2 text-sm">
                        <div className="flex-shrink-0 pt-0.5"><FileStatusIcon status={status.status} /></div>
                        <div className="flex-grow">
                            {/* FIX: Cast config to resolve TypeScript error about property 'labelKey' not existing on type 'unknown'. */}
                            <span className={`${status.status === 'pending' ? 'text-slate-500' : 'text-slate-800'}`}>{t((config as { labelKey: string }).labelKey)}</span>
                             {status.fileName && <p className="text-xs text-slate-500 truncate">{t('fileUpload.fileNameLabel')}: {status.fileName}</p>}
                             {status.error && <p className="text-xs text-red-600">{status.error}</p>}
                        </div>
                    </li>
                );
            })}
        </ul>
      </div>
    </div>
  );
};

export default MultiFileUpload;