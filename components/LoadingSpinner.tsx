import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const LoadingSpinner: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="w-12 h-12 rounded-full animate-spin border-4 border-solid border-blue-500 border-t-transparent"></div>
      <p className="text-slate-600 font-semibold">{t('fileUpload.processing')}</p>
    </div>
  );
};