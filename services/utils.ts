// Helper to convert Excel serial date number to a JS Date object
export const excelSerialToDate = (serial: number): Date | null => {
  if (typeof serial !== 'number' || isNaN(serial)) return null;
  // Excel's epoch starts on 1900-01-01, which is 25569 days before the Unix epoch (1970-01-01).
  // The calculation correctly converts the Excel serial number to a UTC-based JavaScript Date.
  const utc_days = Math.floor(serial - 25569);
  const date = new Date(utc_days * 86400000);
  const fractional_day = serial - Math.floor(serial) + 0.0000001;
  let total_seconds = Math.floor(86400 * fractional_day);
  const seconds = total_seconds % 60;
  total_seconds -= seconds;
  const hours = Math.floor(total_seconds / (60 * 60));
  const minutes = Math.floor(total_seconds / 60) % 60;
  date.setUTCHours(hours, minutes, seconds);
  return date;
};

// Helper to handle Excel's numeric date format for display
export const excelDateToJSDate = (serial: number, format: 'datetime' | 'date' = 'datetime'): string => {
  if(typeof serial !== 'number' || isNaN(serial)) return 'Invalid Date';
  const date = excelSerialToDate(serial);
  if (!date) return 'Invalid Date';

  // Format using UTC components to avoid local timezone conversion, ensuring the displayed
  // date and time match the values in the Excel file exactly.
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // getUTCMonth() is 0-indexed
  const year = date.getUTCFullYear();
  const datePart = `${day}/${month}/${year}`;

  if (format === 'date') {
    return datePart;
  }
  
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const timePart = `${hours}:${minutes}`;
  
  return `${datePart} ${timePart}`;
};

export const parseUnknownDateFormat = (value: any): Date | null => {
    if (typeof value === 'number') {
        return excelSerialToDate(value);
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        const parts = trimmed.split(/[\/\-\s:]+/);
        if (parts.length >= 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // JS month is 0-indexed
            let year = parseInt(parts[2], 10);
            
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                // Correctly handle two-digit years, assuming they are in the 21st century
                if (year >= 0 && year < 100) {
                    year += 2000;
                }

                // Check for time parts
                const hour = parts.length > 3 ? parseInt(parts[3], 10) : 0;
                const minute = parts.length > 4 ? parseInt(parts[4], 10) : 0;
                
                // Use Date.UTC to create a timestamp and then a Date object from it.
                // This ensures the date is treated as UTC, consistent with excelSerialToDate, avoiding timezone issues.
                const utcTimestamp = Date.UTC(year, month, day, isNaN(hour) ? 0 : hour, isNaN(minute) ? 0 : minute);
                const date = new Date(utcTimestamp);
                // Validate against UTC components
                if (date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day) {
                    return date;
                }
            }
        }
    }
    return null;
}