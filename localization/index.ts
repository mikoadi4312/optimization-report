import en from './en';
import id from './id';

export const resources = { en, id };

export const getTranslation = (obj: any, path: string, replacements?: { [key: string]: string | number }): string => {
  const keys = path.split('.');
  let result = keys.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : undefined, obj);
  
  if (typeof result !== 'string') {
      return path; // Return the key itself if not found or not a string
  }

  if (replacements) {
      Object.keys(replacements).forEach(key => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          result = result.replace(regex, String(replacements[key]));
      });
  }
  
  return result;
};
