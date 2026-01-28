import { ReportData, ReportType, TransferGoodsReportPayload, FifoMistakeReportPayload, ProcessedAmData, StaffInfo, IncentiveCriterion, BolltechIncentiveCriterion } from '../types';
import { processSoNotExport } from './reports/soNotExport';
import { processTransferGoods } from './reports/transferGoods';
import { processDepositTools } from './reports/depositTools';
// processFifoMistake is now called directly from App.tsx, not from here.
import { parseUnknownDateFormat } from './utils';

// This function assumes the xlsx library is loaded globally from a CDN.
// @ts-ignore
import XLSX from 'xlsx-js-style';

const cleanHeader = (h: any): string => String(h || '').replace(/\s+/g, ' ').trim().toLowerCase();

const findHeadersAndData = (json: any[][], requiredHeaderKeywords: string[]): { headers: string[], dataRows: any[][] } | null => {
  let headerRowIndex = -1;
  let headers: string[] = [];

  // Search for the header row in the first 100 rows
  for (let i = 0; i < Math.min(100, json.length); i++) {
    const potentialHeaders = json[i] ? json[i].map(cleanHeader) : [];
    console.log(`Scanning row ${i} for headers:`, potentialHeaders); // DEBUG
    // CHANGED: Use partial match (h.includes(rh)) instead of exact match (potentialHeaders.includes(rh))
    if (requiredHeaderKeywords.every(rh => potentialHeaders.some(h => h.includes(rh)))) {
      console.log(`Found headers at row ${i} matching ${requiredHeaderKeywords}`); // DEBUG
      headerRowIndex = i;
      headers = potentialHeaders;
      break;
    }
  }

  if (headerRowIndex === -1) {
    return null;
  }

  const dataRows = json.slice(headerRowIndex + 1);
  return { headers, dataRows };
};


export const processMainDataFile = (file: File, reportType: 'TRANSFER_GOODS' | 'DEPOSIT_TOOLS' | 'SO_NOT_EXPORT' | 'REVENUE_STAFF' | 'INCENTIVE_STAFF' | 'FIFO_DETAIL' | 'STAFF_FIFO_SALES'): Promise<{ dataRows: any[][], headers: string[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (!event.target?.result) throw new Error('File could not be read.');
        const data = new Uint8Array(event.target.result as ArrayBuffer);
        // Use optimized reading options for large files (60MB+)
        const workbook = XLSX.read(data, {
          type: 'array',
          cellFormula: false,
          cellHTML: false,
          cellStyles: false,
          dense: true // Crucial for 60MB files to avoid "Too many properties" error
        });

        // Special handling for STAFF_FIFO_SALES: Scan all sheets for the correct data
        if (reportType === 'STAFF_FIFO_SALES') {
          const scanLog: string[] = [];
          const sheetNames = workbook.SheetNames;


          let firstReadableSheetName: string | null = null;

          for (const sheetName of sheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            if (!worksheet) {
              scanLog.push(`Sheet '${sheetName}': Object undefined in workbook.Sheets (Skipping)`);
              continue;
            }

            // Track the first readable sheet for fallback
            if (!firstReadableSheetName) firstReadableSheetName = sheetName;

            const range = worksheet['!ref'];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

            // Simple check for emptiness
            if (json.length === 0) {
              scanLog.push(`Sheet '${sheetName}' (!ref: ${range || 'null'}): Empty JSON`);
              continue;
            }

            const row0 = json[0] ? json[0].map(cleanHeader) : [];
            const potentialHeaders = row0.length > 0 ? row0 : (json[1] ? json[1].map(cleanHeader) : []);

            const preview = potentialHeaders.slice(0, 5).join(', ');

            // Search for primary key 'imei'
            let foundHeaders = findHeadersAndData(json, ['imei']);
            if (foundHeaders) {
              console.log(`Found Sales Data (by IMEI) in sheet: ${sheetName}`);
              resolve(foundHeaders);
              return;
            }

            // Search for alternative key 'serial number'
            foundHeaders = findHeadersAndData(json, ['serial number']);
            if (foundHeaders) {
              console.log(`Found Sales Data (by Serial Number) in sheet: ${sheetName}`);
              resolve(foundHeaders);
              return;
            }

            // Search for other likely columns
            const altKeywords = ['created user', 'store', 'store name', 'sub category'];
            for (const key of altKeywords) {
              foundHeaders = findHeadersAndData(json, [key]);
              if (foundHeaders) {
                console.log(`Found Sales Data (by ${key}) in sheet: ${sheetName}`);
                resolve(foundHeaders);
                return;
              }
            }

            scanLog.push(`Sheet '${sheetName}': No match. First row: [${preview}]`);
          }

          // Fallback Strategy: Scan values directly if SheetNames lookup failed
          // This handles cases where SheetNames and Sheets keys are out of sync
          if (sheetNames.length > 0) {
            console.log("Attempting fallback scan of all sheet objects...");
            const allSheets = Object.values(workbook.Sheets);
            for (const worksheet of allSheets) {
              // Determine implicit sheet name or index
              const sheetIndex = allSheets.indexOf(worksheet);
              const debugName = `Index_${sheetIndex}`;

              // Reuse scanning logic (refactor if possible, but copy-paste for safety now)
              const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
              if (json.length === 0) continue;

              // Check for headers (Logic duplicated for robustness)
              let foundHeaders = findHeadersAndData(json, ['imei']);
              if (foundHeaders) { resolve(foundHeaders); return; }

              foundHeaders = findHeadersAndData(json, ['serial number']);
              if (foundHeaders) { resolve(foundHeaders); return; }

              foundHeaders = findHeadersAndData(json, ['created user', 'store', 'store name', 'sub category']);
              if (foundHeaders) { resolve(foundHeaders); return; }
            }
          }

          console.warn("Could not find 'IMEI' or 'Serial Number' in any sheet. Falling back to first readable sheet.");

          // Fallback: Check first readable sheet manually
          const sheetName = firstReadableSheetName || workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          if (!worksheet) {
            const debugMsg = `Gagal membaca sheet '${sheetName}'. 
             INFO FILE: Ukuran: ${data.byteLength} bytes.
             SheetNames: [${workbook.SheetNames.join(', ')}]
             SheetsKeys: [${Object.keys(workbook.Sheets).join(', ')}]
             
             Kemungkinan penyebab:
             1. File yang diunggah adalah shortcut (1KB) atau file yang sedang terkunci (~$filename).
             2. File benar-benar rusak/kosong.
             
             SOLUSI: Pastikan file tidak sedang dibuka di aplikasi lain. Gunakan "Save As" ke file baru.
             
             Debug Log:
             ${scanLog.join('\n')}`;

            reject(new Error(debugMsg));
            return;
          }

          const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

          if (json.length < 2) {
            // If fallback is also empty, we MUST tell the user why we failed
            const debugMsg = `Could not identify Sales Data in any sheet. Please ensure one sheet contains 'IMEI' or 'Serial Number'.
            Workbook Details:
            - SheetNames Count: ${workbook.SheetNames.length}
            - Sheets Keys Count: ${Object.keys(workbook.Sheets).length}
            - SheetNames: ${workbook.SheetNames.join(', ')}
            
            Debug Log:
            ${scanLog.join('\n')}`;

            reject(new Error(debugMsg));
            return;
          }

          const headers: string[] = json[0] ? json[0].map((h: any) => String(h || '').trim()) : [];
          resolve({ dataRows: json.slice(1), headers });
          return;
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
        if (json.length < 2) {
          resolve({ dataRows: [], headers: [] });
          return;
        }
        const headers: string[] = json[0] ? json[0].map((h: any) => String(h || '').trim()) : [];
        // FIFO_DETAIL might not have a specific header format, so we search for it.
        if (reportType === 'FIFO_DETAIL') {
          const foundHeaders = findHeadersAndData(json, ['output type', 'sale date']);
          if (foundHeaders) {
            resolve(foundHeaders);
          } else {
            resolve({ dataRows: json.slice(1), headers });
          }
        } else {
          const dataRows = reportType === 'TRANSFER_GOODS' ? json.slice(2) : json.slice(1);
          resolve({ dataRows, headers });
        }
      } catch (err) {
        reject(err instanceof Error ? err : new Error(`Failed to process main data file for ${reportType}.`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read the main data file.'));
    reader.readAsArrayBuffer(file);
  });
};

export const processStaffInfoFile = (file: File): Promise<StaffInfo[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (!event.target?.result) throw new Error('File could not be read.');
        const data = new Uint8Array(event.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

        if (json.length < 1) { resolve([]); return; }

        const requiredHeaders = ['no', 'id staff', 'staff name', 'store name'];
        const headerInfo = findHeadersAndData(json, requiredHeaders);

        if (!headerInfo) {
          throw new Error('Staff Info file must contain "NO", "ID Staff", "Staff Name", and "Store Name" columns.');
        }

        const { headers, dataRows } = headerInfo;
        const noIndex = headers.indexOf('no');
        const idIndex = headers.indexOf('id staff');
        const nameIndex = headers.indexOf('staff name');
        const storeIndex = headers.indexOf('store name');

        const staffInfo: StaffInfo[] = dataRows.map(row => ({
          no: parseInt(String(row[noIndex] || '0')),
          inputUser: String(row[idIndex] || ''),
          staffName: String(row[nameIndex] || ''),
          workingStore: String(row[storeIndex] || ''),
        })).filter(s => s.inputUser && s.no); // Filter out rows without user or NO

        resolve(staffInfo);
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Failed to process Staff Info file."));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read the Staff Info file.'));
    reader.readAsArrayBuffer(file);
  });
};


export const processCategoryFile = (file: File): Promise<any[][]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (!event.target?.result) throw new Error('File could not be read.');
        const data = new Uint8Array(event.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
        resolve(json);
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Failed to process the file."));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read the file.'));
    reader.readAsArrayBuffer(file);
  });
};

export const processAmFile = (file: File): Promise<ProcessedAmData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (!event.target?.result) throw new Error('File could not be read.');
        const data = new Uint8Array(event.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length < 1) throw new Error("AM file is empty or has no data rows.");

        const baseRequired = ['store code', 'am name'];
        let headerRowIndex = -1;
        let headers: string[] = [];

        for (let i = 0; i < Math.min(10, json.length); i++) {
          const potentialHeaders = json[i] ? json[i].map(cleanHeader) : [];
          if (baseRequired.every(rh => potentialHeaders.includes(rh))) {
            headerRowIndex = i;
            headers = potentialHeaders;
            break;
          }
        }

        if (headerRowIndex === -1) {
          throw new Error('AM file must contain at least "Store Code" and "AM Name" columns.');
        }

        const dataRows = json.slice(headerRowIndex + 1);
        const storeCodeIndex = headers.indexOf('store code');
        const amNameIndex = headers.indexOf('am name');
        const storeNameIndex = headers.indexOf('store name');
        const cityIndex = headers.indexOf('city');

        // Flexible G.O. column detection
        let goIndex = headers.indexOf('g.o');
        if (goIndex === -1) goIndex = headers.indexOf('go');
        if (goIndex === -1) goIndex = headers.indexOf('grand opening');
        if (goIndex === -1) goIndex = headers.indexOf('opening date');
        if (goIndex === -1) goIndex = headers.indexOf('tgl go'); // Indonesian variation

        const codeToAm = new Map<string, string>();
        const nameToCode = new Map<string, string>();
        const codeToName = new Map<string, string>();
        const codeToCity = new Map<string, string>();
        const codeToGO = new Map<string, Date>();

        for (const row of dataRows) {
          // Get the full Store Code value (e.g., "15863 - EBM_BAN_TANGKOT_CLD_JL HOS Cokroaminoto")
          const storeCodeFull = String(row[storeCodeIndex] || '').trim();
          // Extract just the code part (e.g., "15863")
          const storeCode = storeCodeFull.split(' ')[0];
          const amName = String(row[amNameIndex] || '').trim();

          if (storeCode && amName) {
            codeToAm.set(storeCode, amName);

            // Check if there's a separate "Store Name" column
            if (storeNameIndex > -1) {
              const storeName = String(row[storeNameIndex] || '').trim();
              if (storeName) {
                nameToCode.set(storeName, storeCode);
                // Add uppercase version for case-insensitive lookup
                nameToCode.set(storeName.toUpperCase(), storeCode);
                codeToName.set(storeCode, storeName);
              }
            } else if (storeCodeFull && storeCodeFull !== storeCode) {
              // If no separate Store Name column, use the full Store Code value
              // This handles cases where Store Code contains: "15863 - EBM_BAN_TANGKOT_CLD_JL HOS Cokroaminoto"
              codeToName.set(storeCode, storeCodeFull);
              nameToCode.set(storeCodeFull, storeCode);
              nameToCode.set(storeCodeFull.toUpperCase(), storeCode);
            }

            if (cityIndex > -1) {
              const city = String(row[cityIndex] || '').trim();
              if (city) codeToCity.set(storeCode, city);
            }

            if (goIndex > -1) {
              const goDate = parseUnknownDateFormat(row[goIndex]);
              if (goDate) {
                // Normalize to midnight to avoid time-based exclusion issues
                goDate.setHours(0, 0, 0, 0);
                codeToGO.set(storeCode, goDate);
              }
            }
          }
        }
        resolve({ codeToAm, nameToCode, codeToName, codeToCity, codeToGO });
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Failed to process AM file."));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read the AM file.'));
    reader.readAsArrayBuffer(file);
  });
};

export const processIncentiveCriteriaFile = (file: File): Promise<IncentiveCriterion[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (!event.target?.result) throw new Error('File could not be read.');
        const data = new Uint8Array(event.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

        if (json.length < 1) { resolve([]); return; }

        const requiredHeaders = ['product code', 'start date', 'end date', 'incentive / unit'];
        const headerInfo = findHeadersAndData(json, requiredHeaders);

        if (!headerInfo) {
          throw new Error('Incentive Criteria file must contain "Product code", "Start date", "End date", and "Incentive / unit" columns.');
        }

        const { headers, dataRows } = headerInfo;
        const productCodeIndex = headers.indexOf('product code');
        const startDateIndex = headers.indexOf('start date');
        const endDateIndex = headers.indexOf('end date');
        const incentiveIndex = headers.indexOf('incentive / unit');

        const criteria: IncentiveCriterion[] = dataRows.map(row => {
          const startDate = parseUnknownDateFormat(row[startDateIndex]);
          const endDate = parseUnknownDateFormat(row[endDateIndex]);
          const incentivePerUnit = parseFloat(String(row[incentiveIndex] || '0').replace(/[^0-9,-]+/g, "").replace(",", "."));

          if (!startDate || !endDate || isNaN(incentivePerUnit)) {
            return null;
          }

          // Use UTC methods to ensure timezone-agnostic comparison
          startDate.setUTCHours(0, 0, 0, 0);
          endDate.setUTCHours(23, 59, 59, 999);

          return {
            productCode: String(row[productCodeIndex] || ''),
            startDate,
            endDate,
            incentivePerUnit,
          };
        }).filter((c): c is IncentiveCriterion => c !== null && !!c.productCode);

        resolve(criteria);
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Failed to process Incentive Criteria file."));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read the Incentive Criteria file.'));
    reader.readAsArrayBuffer(file);
  });
};

export const processBolltechIncentiveCriteriaFile = (file: File): Promise<BolltechIncentiveCriterion[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (!event.target?.result) throw new Error('File could not be read.');
        const data = new Uint8Array(event.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

        if (json.length < 1) { resolve([]); return; }

        const requiredHeaders = ['product code + srp bolttech', 'start date', 'end date', 'incentive / unit'];
        const headerInfo = findHeadersAndData(json, requiredHeaders);

        if (!headerInfo) {
          throw new Error('Bolltech Criteria file must contain "Product code + SRP Bolttech", "Start date", "End date", and "Incentive / unit" columns.');
        }

        const { headers, dataRows } = headerInfo;
        const combinedKeyIndex = headers.indexOf('product code + srp bolttech');
        const startDateIndex = headers.indexOf('start date');
        const endDateIndex = headers.indexOf('end date');
        const incentiveIndex = headers.indexOf('incentive / unit');

        const criteria: BolltechIncentiveCriterion[] = dataRows.map(row => {
          const startDate = parseUnknownDateFormat(row[startDateIndex]);
          const endDate = parseUnknownDateFormat(row[endDateIndex]);
          const incentivePerUnit = parseFloat(String(row[incentiveIndex] || '0').replace(/[^0-9,-]+/g, "").replace(",", "."));
          const combinedKey = String(row[combinedKeyIndex] || '').trim();

          if (!startDate || !endDate || isNaN(incentivePerUnit) || !combinedKey) {
            return null;
          }

          // Use UTC methods to ensure timezone-agnostic comparison
          startDate.setUTCHours(0, 0, 0, 0);
          endDate.setUTCHours(23, 59, 59, 999);

          return {
            combinedKey,
            startDate,
            endDate,
            incentivePerUnit,
          };
        }).filter((c): c is BolltechIncentiveCriterion => c !== null);

        resolve(criteria);
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Failed to process Bolltech Incentive Criteria file."));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read the Bolltech Incentive Criteria file.'));
    reader.readAsArrayBuffer(file);
  });
};



export const processExcelFile = (
  file: File,
  reportType: ReportType,
): Promise<ReportData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error('File could not be read.');
        }

        const data = new Uint8Array(event.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

        if (json.length < 2) {
          resolve([]);
          return;
        }

        const headers: string[] = json[0] ? json[0].map((h: any) => String(h || '').trim()) : [];
        const dataRows = json.slice(1);

        switch (reportType) {
          case 'SO_NOT_EXPORT':
            resolve(processSoNotExport(dataRows, headers));
            break;
          case 'TRANSFER_GOODS':
          case 'DEPOSIT_TOOLS':
          case 'FIFO':
          case 'REVENUE_STAFF':
          case 'INCENTIVE_STAFF':
            // These cases are now handled by multi-file upload logic in App.tsx
            resolve([]);
            break;
          default:
            reject(new Error("Unknown report type selected."));
        }

      } catch (err) {
        reject(err instanceof Error ? err : new Error("An unexpected error occurred during file processing."));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read the file.'));
    reader.readAsArrayBuffer(file);
  });
};