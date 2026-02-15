import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'; // Force reload
// FIX: Added DepositToolsData to the import to resolve 'Cannot find name' error.
import { ReportData, ReportType, AMSummaryData, TransferGoodsReportPayload, FifoMistakeReportPayload, ProcessedAmData, FifoWeeklySummary, FifoFileKey, FileStatus, TgFileKey, DtFileKey, DepositToolsData, RsFileKey, RevenueStaffRow, StaffInfo, IncentiveCriterion, IsFileKey, IncentiveStaffRow, IsbFileKey, BolltechIncentiveCriterion, UnderperformedCategoryData, FifoResumeData, StaffFifoFileKey, StaffMistakeResumeRow, StaffMistakeReportPayload } from './types';
import { processAmFile, processCategoryFile, processMainDataFile, processStaffInfoFile, processIncentiveCriteriaFile, processBolltechIncentiveCriteriaFile } from './services/excelService';
import { parseUnknownDateFormat } from './services/utils';
import { processFifoMistake } from './services/reports/fifoMistake';
import { processTransferGoods } from './services/reports/transferGoods';
import { processDepositTools, processDepositToolsFromDB, parseDepositExcelRows } from './services/reports/depositTools';

// ... (existing imports)

// ...

// ... (existing imports)

import { processRevenueStaff } from './services/reports/revenueStaff';
import { processIncentiveStaff } from './services/reports/incentiveStaff';
import { processIncentiveStaffBolltech } from './services/reports/incentiveStaffBolltech';
import { apiService, ApiTransaction } from './services/api';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FileUpload from './components/FileUpload';
import ReportTable from './components/ReportTable';
import InstructionCard from './components/InstructionCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import MultiFileUpload from './components/MultiFileUpload';
// FIX: Imported processSoNotExport to resolve 'Cannot find name' error.
import { processSoNotExport } from './services/reports/soNotExport';
import { processStaffFifoMistake } from './services/reports/staffFifoMistake';
import { useLanguage } from './contexts/LanguageContext';
import DepositManualInput from './components/reports/DepositManualInput';

const initialFifoFileStatuses: Record<FifoFileKey, FileStatus> = {
  am: { status: 'pending', fileName: null, error: null },
  phone: { status: 'pending', fileName: null, error: null },
  tablet: { status: 'pending', fileName: null, error: null },
  tv: { status: 'pending', fileName: null, error: null },
  speaker: { status: 'pending', fileName: null, error: null },
  detailPhone: { status: 'pending', fileName: null, error: null },
  detailTablet: { status: 'pending', fileName: null, error: null },
  detailTv: { status: 'pending', fileName: null, error: null },
  detailSpeaker: { status: 'pending', fileName: null, error: null },
};

const initialStaffFifoFileStatuses: Record<StaffFifoFileKey, FileStatus> = {
  am: { status: 'pending', fileName: null, error: null },
  salesData: { status: 'pending', fileName: null, error: null },
  detailPhone: { status: 'pending', fileName: null, error: null },
  detailTablet: { status: 'pending', fileName: null, error: null },
  detailTv: { status: 'pending', fileName: null, error: null },
  detailSpeaker: { status: 'pending', fileName: null, error: null },
};


const initialTgFileStatuses: Record<TgFileKey, FileStatus> = {
  am: { status: 'pending', fileName: null, error: null },
  transferGoods: { status: 'pending', fileName: null, error: null },
};

const initialDtFileStatuses: Record<DtFileKey, FileStatus> = {
  am: { status: 'pending', fileName: null, error: null },
  depositTools: { status: 'pending', fileName: null, error: null },
};

const initialRsFileStatuses: Record<RsFileKey, FileStatus> = {
  monthFile1: { status: 'pending', fileName: null, error: null },
  monthFile2: { status: 'pending', fileName: null, error: null },
  monthFile3: { status: 'pending', fileName: null, error: null },
  monthFile4: { status: 'pending', fileName: null, error: null },
  monthFile5: { status: 'pending', fileName: null, error: null },
  monthFile6: { status: 'pending', fileName: null, error: null },
  staffInfo: { status: 'pending', fileName: null, error: null },
};

const initialIsFileStatuses: Record<IsFileKey, FileStatus> = {
  criteria: { status: 'pending', fileName: null, error: null },
  mainData: { status: 'pending', fileName: null, error: null },
};

const initialIsbFileStatuses: Record<IsbFileKey, FileStatus> = {
  criteriaBolltech: { status: 'pending', fileName: null, error: null },
  mainData: { status: 'pending', fileName: null, error: null },
};


const fifoFileConfig: Record<FifoFileKey, { labelKey: string; keyword: string }> = {
  am: { labelKey: 'fileLabels.am', keyword: 'am' },
  phone: { labelKey: 'fileLabels.phone', keyword: 'phone' },
  tablet: { labelKey: 'fileLabels.tablet', keyword: 'tablet' },
  tv: { labelKey: 'fileLabels.tv', keyword: 'tv' },
  speaker: { labelKey: 'fileLabels.speaker', keyword: 'speaker' },
  detailPhone: { labelKey: 'fileLabels.detailPhone', keyword: 'detail phone' },
  detailTablet: { labelKey: 'fileLabels.detailTablet', keyword: 'detail tablet' },
  detailTv: { labelKey: 'fileLabels.detailTv', keyword: 'detail tv' },
  detailSpeaker: { labelKey: 'fileLabels.detailSpeaker', keyword: 'detail speaker' },
};

const staffFifoFileConfig: Record<StaffFifoFileKey, { labelKey: string; keyword: string }> = {
  am: { labelKey: 'fileLabels.am', keyword: 'am' },
  salesData: { labelKey: 'fileLabels.salesData', keyword: 'penjualan' }, // user mentioned 'Data Penjualan' so 'penjualan' should match.

  detailPhone: { labelKey: 'fileLabels.detailPhone', keyword: 'detail phone' },
  detailTablet: { labelKey: 'fileLabels.detailTablet', keyword: 'detail tablet' },
  detailTv: { labelKey: 'fileLabels.detailTv', keyword: 'detail tv' },
  detailSpeaker: { labelKey: 'fileLabels.detailSpeaker', keyword: 'detail speaker' },
};


const tgFileConfig: Record<TgFileKey, { labelKey: string; keyword: string }> = {
  am: { labelKey: 'fileLabels.am', keyword: 'am' },
  transferGoods: { labelKey: 'fileLabels.transferGoods', keyword: 'transfer' },
};

const dtFileConfig: Record<DtFileKey, { labelKey: string; keyword: string }> = {
  am: { labelKey: 'fileLabels.am', keyword: 'am' },
  depositTools: { labelKey: 'fileLabels.depositTools', keyword: 'deposit' },
};

const rsFileConfig: Record<RsFileKey, { labelKey: string; keyword: string }> = {
  staffInfo: { labelKey: 'fileLabels.staffInfo', keyword: 'staff' },
  monthFile1: { labelKey: 'fileLabels.month1', keyword: 'month1' },
  monthFile2: { labelKey: 'fileLabels.month2', keyword: 'month2' },
  monthFile3: { labelKey: 'fileLabels.month3', keyword: 'month3' },
  monthFile4: { labelKey: 'fileLabels.month4', keyword: 'month4' },
  monthFile5: { labelKey: 'fileLabels.month5', keyword: 'month5' },
  monthFile6: { labelKey: 'fileLabels.month6', keyword: 'month6' },
};

const isFileConfig: Record<IsFileKey, { labelKey: string; keyword: string }> = {
  criteria: { labelKey: 'fileLabels.criteria', keyword: 'criteria' },
  mainData: { labelKey: 'fileLabels.mainData', keyword: 'data' },
};

const isbFileConfig: Record<IsbFileKey, { labelKey: string; keyword: string }> = {
  criteriaBolltech: { labelKey: 'fileLabels.criteriaBolltech', keyword: 'bolltech' },
  mainData: { labelKey: 'fileLabels.mainData', keyword: 'data' },
};


const App: React.FC = () => {
  const { t } = useLanguage();
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [amSummaryData, setAmSummaryData] = useState<AMSummaryData[]>([]);
  const [fifoSummaries, setFifoSummaries] = useState<FifoWeeklySummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLimitedView, setIsLimitedView] = useState<boolean>(false);
  const [reportType, setReportType] = useState<ReportType>('SO_NOT_EXPORT');
  const [incentiveSubType, setIncentiveSubType] = useState<'STANDARD' | 'BOLLTECH'>('STANDARD');
  const [fifoSubType, setFifoSubType] = useState<'STORE' | 'STAFF'>('STORE');
  const [underperformedData, setUnderperformedData] = useState<UnderperformedCategoryData | null>(null);
  const [resumeData, setResumeData] = useState<FifoResumeData | null>(null);
  // Persistent state for FIFO reports
  const [storeFifoData, setStoreFifoData] = useState<{
    data: ReportData[],
    summaries: FifoWeeklySummary[],
    underperformedData: UnderperformedCategoryData | null,
    resumeData: FifoResumeData | null
  } | null>(null);

  const [staffFifoData, setStaffFifoData] = useState<{
    data: ReportData[],
    dateRange: { min: Date | null, max: Date | null }
  } | null>(null);

  const [staffFifoDateRange, setStaffFifoDateRange] = useState<{ min: Date | null, max: Date | null } | null>(null);

  // Ref to prevent reloading from DB immediately after manual file upload
  const blockDbLoadRef = useRef(false);

  const handleClearData = useCallback(() => {
    if (reportType === 'FIFO') {
      if (fifoSubType === 'STORE') {
        setStoreFifoData(null);
        setReportData([]);
        setFifoSummaries([]);
        setUnderperformedData(null);
        setResumeData(null);
        setFileName(null);
        setFifoFileStatuses(initialFifoFileStatuses);
        // Reset file data as well to compel new upload
        setAmData(null);
        setPhoneData(null);
        setTabletData(null);
        setTvData(null);
        setSpeakerData(null);
        setDetailPhoneData(null);
        setDetailTabletData(null);
        setDetailTvData(null);
        setDetailSpeakerData(null);
      } else if (fifoSubType === 'STAFF') {
        setStaffFifoData(null);
        setReportData([]);
        setStaffFifoDateRange(null);
        setFileName(null);
        setStaffFifoFileStatuses(initialStaffFifoFileStatuses);
        // Reset file data
        setAmData(null);
        setSalesData(null);
        setDetailPhoneData(null);
        setDetailTabletData(null);
        setDetailTvData(null);
        setDetailSpeakerData(null);
      }
    }
  }, [reportType, fifoSubType]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const viewMode = searchParams.get('view');
    if (viewMode === 'limited') {
      setIsLimitedView(true);
      setReportType('FIFO');
    }
  }, []);


  // Shared state for AM data
  const [amData, setAmData] = useState<ProcessedAmData | null>(null);

  const [tgRawData, setTgRawData] = useState<{ dataRows: any[][], headers: string[] } | null>(null);
  const [dtRawData, setDtRawData] = useState<{ dataRows: any[][], headers: string[] } | null>(null);
  const [rsRawData, setRsRawData] = useState<{ dataRows: any[][], headers: string[] }[]>([]);
  const [isRawData, setIsRawData] = useState<{ dataRows: any[][], headers: string[] } | null>(null);
  const [salesData, setSalesData] = useState<{ dataRows: any[][], headers: string[] } | null>(null);
  const [staffInfoData, setStaffInfoData] = useState<StaffInfo[] | null>(null);
  const [criteriaData, setCriteriaData] = useState<IncentiveCriterion[] | null>(null);
  const [bolltechCriteriaData, setBolltechCriteriaData] = useState<BolltechIncentiveCriterion[] | null>(null);
  const [phoneData, setPhoneData] = useState<any[][] | null>(null);
  const [tabletData, setTabletData] = useState<any[][] | null>(null);
  const [tvData, setTvData] = useState<any[][] | null>(null);
  const [speakerData, setSpeakerData] = useState<any[][] | null>(null);
  const [detailPhoneData, setDetailPhoneData] = useState<{ dataRows: any[][], headers: string[] } | null>(null);
  const [detailTabletData, setDetailTabletData] = useState<{ dataRows: any[][], headers: string[] } | null>(null);
  const [detailTvData, setDetailTvData] = useState<{ dataRows: any[][], headers: string[] } | null>(null);
  const [detailSpeakerData, setDetailSpeakerData] = useState<{ dataRows: any[][], headers: string[] } | null>(null);

  // State for multi-file uploads
  const [isProcessing, setIsProcessing] = useState(false);
  const [fifoFileStatuses, setFifoFileStatuses] = useState(initialFifoFileStatuses);
  const [staffFifoFileStatuses, setStaffFifoFileStatuses] = useState(initialStaffFifoFileStatuses);
  const [tgFileStatuses, setTgFileStatuses] = useState(initialTgFileStatuses);
  const [dtFileStatuses, setDtFileStatuses] = useState(initialDtFileStatuses);
  const [rsFileStatuses, setRsFileStatuses] = useState(initialRsFileStatuses);
  const [isFileStatuses, setIsFileStatuses] = useState(initialIsFileStatuses);
  const [isFileBolltechStatuses, setIsFileBolltechStatuses] = useState(initialIsbFileStatuses);


  const resetAllFileUploadStates = () => {
    setAmData(null);
    setTgRawData(null);
    setDtRawData(null);
    setRsRawData([]);
    setStaffInfoData(null);
    setPhoneData(null);
    setTabletData(null);
    setTvData(null);
    setSpeakerData(null);
    setDetailPhoneData(null);
    setDetailTabletData(null);
    setDetailTvData(null);
    setDetailSpeakerData(null);
    setCriteriaData(null);
    setBolltechCriteriaData(null);
    setIsRawData(null);
    setSalesData(null);
    setFifoFileStatuses(initialFifoFileStatuses);
    setStaffFifoFileStatuses(initialStaffFifoFileStatuses);
    setTgFileStatuses(initialTgFileStatuses);
    setDtFileStatuses(initialDtFileStatuses);
    setRsFileStatuses(initialRsFileStatuses);
    setIsFileStatuses(initialIsFileStatuses);
    setIsFileBolltechStatuses(initialIsbFileStatuses);
  };

  const handleFifoFilesProcess = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    // resetAllFileUploadStates();


    const fileIdentifierMap: { key: FifoFileKey, keyword: string, processor: (file: File) => Promise<any>, setter: (data: any) => void }[] = [
      { key: 'am', keyword: 'am', processor: processAmFile, setter: setAmData },
      { key: 'phone', keyword: 'phone', processor: processCategoryFile, setter: setPhoneData },
      { key: 'tablet', keyword: 'tablet', processor: processCategoryFile, setter: setTabletData },
      { key: 'tv', keyword: 'tv', processor: processCategoryFile, setter: setTvData },
      { key: 'speaker', keyword: 'speaker', processor: processCategoryFile, setter: setSpeakerData },
      { key: 'detailPhone', keyword: 'detail phone', processor: (file) => processMainDataFile(file, 'FIFO_DETAIL'), setter: setDetailPhoneData },
      { key: 'detailTablet', keyword: 'detail tablet', processor: (file) => processMainDataFile(file, 'FIFO_DETAIL'), setter: setDetailTabletData },
      { key: 'detailTv', keyword: 'detail tv', processor: (file) => processMainDataFile(file, 'FIFO_DETAIL'), setter: setDetailTvData },
      { key: 'detailSpeaker', keyword: 'detail speaker', processor: (file) => processMainDataFile(file, 'FIFO_DETAIL'), setter: setDetailSpeakerData },
    ];

    const processingPromises = files.map(file => {
      const lowerCaseName = file.name.toLowerCase();
      // Find the best match - longer keyword matches first to avoid "phone" matching "detail phone"
      // FIX: Use a more robust matching logic that checks for all parts of a compound keyword.
      const identifiers = fileIdentifierMap.filter(id =>
        id.keyword.split(' ').every(part => lowerCaseName.includes(part))
      );
      const identifier = identifiers.sort((a, b) => b.keyword.length - a.keyword.length)[0];

      if (identifier) {
        return identifier.processor(file)
          .then(data => {
            identifier.setter(data);
            setFifoFileStatuses(prev => ({ ...prev, [identifier.key]: { status: 'success', fileName: file.name, error: null } }));
          })
          .catch(err => {
            const errorMessage = err instanceof Error ? t(err.message) : t('app.errors.processingFailed');
            setFifoFileStatuses(prev => ({ ...prev, [identifier.key]: { status: 'error', fileName: file.name, error: errorMessage } }));
          });
      }
      return Promise.resolve();
    });

    await Promise.allSettled(processingPromises);
    setIsProcessing(false);
  }, [t]);



  const handleStaffFifoFilesProcess = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    // resetAllFileUploadStates();


    const fileIdentifierMap: { key: StaffFifoFileKey, keyword: string, processor: (file: File) => Promise<any>, setter: (data: any) => void }[] = [
      { key: 'am', keyword: 'am', processor: processAmFile, setter: setAmData },
      { key: 'salesData', keyword: 'penjualan', processor: (file) => processMainDataFile(file, 'STAFF_FIFO_SALES'), setter: setSalesData },
      { key: 'detailPhone', keyword: 'detail phone', processor: (file) => processMainDataFile(file, 'FIFO_DETAIL'), setter: setDetailPhoneData },
      { key: 'detailTablet', keyword: 'detail tablet', processor: (file) => processMainDataFile(file, 'FIFO_DETAIL'), setter: setDetailTabletData },
      { key: 'detailTv', keyword: 'detail tv', processor: (file) => processMainDataFile(file, 'FIFO_DETAIL'), setter: setDetailTvData },
      { key: 'detailSpeaker', keyword: 'detail speaker', processor: (file) => processMainDataFile(file, 'FIFO_DETAIL'), setter: setDetailSpeakerData },
    ];

    const processingPromises = files.map(file => {
      const lowerCaseName = file.name.toLowerCase();
      const identifiers = fileIdentifierMap.filter(id => {
        const idKeywordParts = id.keyword.toLowerCase().split(' ');
        // Check if ALL parts of the keyword exists in the filename
        return idKeywordParts.every(part => lowerCaseName.includes(part));
      });
      const identifier = identifiers.sort((a, b) => b.keyword.length - a.keyword.length)[0];

      if (identifier) {
        return identifier.processor(file)
          .then(data => {
            identifier.setter(data);
            setStaffFifoFileStatuses(prev => ({ ...prev, [identifier.key]: { status: 'success', fileName: file.name, error: null } }));
          })
          .catch(err => {
            const errorMessage = err instanceof Error ? t(err.message) : t('app.errors.processingFailed');
            setStaffFifoFileStatuses(prev => ({ ...prev, [identifier.key]: { status: 'error', fileName: file.name, error: errorMessage } }));
          });
      }
      return Promise.resolve();
    });

    await Promise.allSettled(processingPromises);
    setIsProcessing(false);
  }, [t]);



  const handleTgFilesProcess = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    resetAllFileUploadStates();

    const fileIdentifierMap: { key: TgFileKey, keyword: string, processor: (file: File) => Promise<any>, setter: (data: any) => void }[] = [
      { key: 'am', keyword: 'am', processor: processAmFile, setter: setAmData },
      { key: 'transferGoods', keyword: 'transfer', processor: (file) => processMainDataFile(file, 'TRANSFER_GOODS'), setter: setTgRawData },
    ];

    const processingPromises = files.map(file => {
      const lowerCaseName = file.name.toLowerCase();
      const identifier = fileIdentifierMap.find(id => lowerCaseName.includes(id.keyword));

      if (identifier) {
        return identifier.processor(file)
          .then(data => {
            identifier.setter(data);
            setTgFileStatuses(prev => ({ ...prev, [identifier.key]: { status: 'success', fileName: file.name, error: null } }));
          })
          .catch(err => {
            const errorMessage = err instanceof Error ? t(err.message) : t('app.errors.processingFailed');
            setTgFileStatuses(prev => ({ ...prev, [identifier.key]: { status: 'error', fileName: file.name, error: errorMessage } }));
          });
      }
      return Promise.resolve();
    });

    await Promise.allSettled(processingPromises);
    setIsProcessing(false);
  }, [t]);


  // -- DATABASE INTEGRATION FOR DEPOSIT TOOLS --
  const loadDepositToolsFromDB = useCallback(async () => {
    if (!amData) return; // Butuh AM Data untuk proses FIFO

    try {
      setIsLoading(true);
      // CALL CLOUDFLARE API via Services
      const dbRows = await apiService.fetchDeposits();

      if (Array.isArray(dbRows)) {
        console.log("D1 Data Loaded:", dbRows.length, "rows");
        const processedData = processDepositToolsFromDB(dbRows, amData);
        setReportData(processedData);
        // setFileName('Cloud_Database_Report'); 
      }
    } catch (err) {
      console.error("Failed to load from Cloud DB:", err);
      // Fallback: don't break UI, just log error
    } finally {
      setIsLoading(false);
    }
  }, [amData]);

  // Load data when entering Deposit Tools menu AND AM Data is ready
  useEffect(() => {
    if (reportType === 'DEPOSIT_TOOLS' && amData) {
      if (blockDbLoadRef.current) {
        console.log("🚫 Skipping DB Load due to recent manual file upload");
        blockDbLoadRef.current = false;
        return;
      }
      loadDepositToolsFromDB();
    }
  }, [reportType, amData, loadDepositToolsFromDB]);


  // Update handleDtFilesProcess to IMPORT to DB instead of strictly setting state
  const handleDtFilesProcess = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    resetAllFileUploadStates(); // Reset status UI

    // Parsing Excel seperti biasa
    const fileIdentifierMap: { key: DtFileKey, keyword: string, processor: (file: File) => Promise<any>, setter: (data: any) => void }[] = [
      { key: 'am', keyword: 'am', processor: processAmFile, setter: setAmData },
      { key: 'depositTools', keyword: 'deposit', processor: (file) => processMainDataFile(file, 'DEPOSIT_TOOLS'), setter: setDtRawData },
    ];

    const processingPromises = files.map(file => {
      const lowerCaseName = file.name.toLowerCase();
      const identifier = fileIdentifierMap.find(id => lowerCaseName.includes(id.keyword));

      if (identifier) {
        return identifier.processor(file)
          .then(data => {
            identifier.setter(data);
            return { key: identifier.key, data, fileName: file.name, status: 'success' };
          })
          .catch(err => {
            const errorMessage = err instanceof Error ? t(err.message) : t('app.errors.processingFailed');
            setDtFileStatuses(prev => ({ ...prev, [identifier.key]: { status: 'error', fileName: file.name, error: errorMessage } }));
            throw err;
          });
      }
      return Promise.resolve(null);
    });

    try {
      const results = await Promise.all(processingPromises);

      // Ambil hasil parsing Deposit Tools
      const dtResult = results.find(r => r && r.key === 'depositTools');

      if (dtResult && dtResult.data && dtResult.status === 'success') {
        const { dataRows, headers } = dtResult.data;

        // Ambil AM Data yang benar (prioritas: baru diupload > state lama)
        const amResult = results.find(r => r && r.key === 'am');
        const effectiveAmData = amResult ? amResult.data : amData;

        if (!effectiveAmData) {
          // Jika AM data tidak ada sama sekali, user harus upload.
          // (Status update akan ditangani di bawah)
        } else {
          // 1. SHOW PREVIEW FIRST (Prioritas Utama: Data Tampil)
          console.group("🔍 DEPOSIT TOOLS DEBUG");
          console.log("1. Raw Data Rows:", dataRows.length);
          console.log("2. Detected Headers:", headers);
          console.log("3. AM Data Available:", !!effectiveAmData, effectiveAmData?.codeToName?.size || 0);

          try {
            // BLOCK DB LOAD to prevent overwriting this data
            blockDbLoadRef.current = true;

            // 1. SHOW PREVIEW FIRST (Prioritas Utama: Data Tampil)
            const processedData = processDepositTools(dataRows, headers, effectiveAmData);
            console.log("4. Final Processed Data:", processedData.length, "rows");
            setReportData(processedData);

            // 2. BACKGROUND SAVE TO CLOUD D1 (Silent)
            (async () => {
              try {
                const transactions = parseDepositExcelRows(dataRows, headers);
                // Sanitize data for API
                const cleanTransactions: ApiTransaction[] = transactions.map(t => ({
                  storeCode: t.storeCode,
                  inOutVoucher: t.inOutVoucher,
                  customerName: t.customerName,
                  date: t.date ? t.date.toISOString() : null, // Convert Date object to string
                  amount: t.amount,
                  voucherType: t.voucherType,
                  voucherReference: t.voucherReference,
                  content: t.content
                }));

                console.log("☁️ Uploading to Cloud D1...", cleanTransactions.length, "rows");

                const result = await apiService.uploadDeposits(cleanTransactions);

                if (result.success) {
                  console.log("✅ CLOUD SYNC SUCCESS:", result.count, "records saved.");
                } else {
                  console.warn("⚠️ CLOUD SYNC FAILED:", result);
                }
              } catch (bgError) {
                console.error("❌ CLOUD NETWORK ERROR:", bgError);
              }
            })();

          } catch (err: any) {
            console.error("❌ PROCESSING ERROR:", err);
            setError("Gagal memproses data: " + err.message);
          }
          console.groupEnd();
        }

        setDtFileStatuses(prev => ({ ...prev, depositTools: { status: 'success', fileName: dtResult.fileName, error: null } }));
      }

      // Update AM Status logic
      const amResult = results.find(r => r && r.key === 'am');
      if (amResult && amResult.status === 'success') {
        setDtFileStatuses(prev => ({ ...prev, am: { status: 'success', fileName: amResult.fileName, error: null } }));
      }

    } catch (err) {
      console.error("Upload error", err);
    } finally {
      setIsProcessing(false);
    }
  }, [t, resetAllFileUploadStates, amData]);

  const handleRsFilesProcess = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    resetAllFileUploadStates();
    setError(null);

    if (files.length !== 7) {
      setError(t('app.errors.rsIncorrectFileCount'));
      setIsProcessing(false);
      const errorStatus = { status: 'error' as const, fileName: null, error: t('app.errors.rsIncorrectFileCountStatus') };
      setRsFileStatuses({ ...initialRsFileStatuses, ...errorStatus });
      return;
    }

    const newStatuses: Record<RsFileKey, FileStatus> = { ...initialRsFileStatuses };
    let staffFile: File | null = null;
    const monthlyFiles: File[] = [];

    files.forEach(file => {
      if (file.name.toLowerCase().includes(rsFileConfig.staffInfo.keyword)) {
        staffFile = file;
      } else {
        monthlyFiles.push(file);
      }
    });

    if (!staffFile || monthlyFiles.length !== 6) {
      setError(t('app.errors.rsFileIdentification'));
      setIsProcessing(false);

      const errorMsg = monthlyFiles.length !== 6 ? t('app.errors.incorrectCount') : 'OK';
      setRsFileStatuses({
        staffInfo: { status: 'error', fileName: null, error: !staffFile ? t('app.errors.missing') : 'OK' },
        monthFile1: { status: 'error', fileName: null, error: errorMsg },
        monthFile2: { status: 'error', fileName: null, error: errorMsg },
        monthFile3: { status: 'error', fileName: null, error: errorMsg },
        monthFile4: { status: 'error', fileName: null, error: errorMsg },
        monthFile5: { status: 'error', fileName: null, error: errorMsg },
        monthFile6: { status: 'error', fileName: null, error: errorMsg },
      });
      return;
    }

    const staffPromise = processStaffInfoFile(staffFile)
      .then(data => {
        setStaffInfoData(data);
        newStatuses.staffInfo = { status: 'success', fileName: staffFile!.name, error: null };
      })
      .catch(err => {
        const msg = err instanceof Error ? t(err.message) : t('app.errors.processingFailed');
        newStatuses.staffInfo = { status: 'error', fileName: staffFile!.name, error: msg };
      });

    const processedMonthlyData: { dataRows: any[][], headers: string[] }[] = [];
    const monthlyPromises = monthlyFiles.map((file, index) => {
      const fileKey = `monthFile${index + 1}` as RsFileKey;
      return processMainDataFile(file, 'REVENUE_STAFF')
        .then(data => {
          processedMonthlyData.push(data);
          newStatuses[fileKey] = { status: 'success', fileName: file.name, error: null };
        })
        .catch(err => {
          const msg = err instanceof Error ? t(err.message) : t('app.errors.processingFailed');
          newStatuses[fileKey] = { status: 'error', fileName: file.name, error: msg };
        });
    });

    await Promise.allSettled([staffPromise, ...monthlyPromises]);
    setRsFileStatuses(newStatuses);

    if (newStatuses.staffInfo.status === 'success' && processedMonthlyData.length === 6) {
      setRsRawData(processedMonthlyData);
    } else {
      setError(t('app.errors.fileProcessFailed'));
    }

    setIsProcessing(false);
  }, [t]);

  const handleIsFilesProcess = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    resetAllFileUploadStates();
    setError(null);

    if (files.length !== 2) {
      setError(t('app.errors.isIncorrectFileCount'));
      setIsProcessing(false);
      const errorStatus = { status: 'error' as const, fileName: null, error: t('app.errors.isIncorrectFileCountStatus') };
      setIsFileStatuses({ criteria: errorStatus, mainData: errorStatus });
      return;
    }

    const newStatuses: Record<IsFileKey, FileStatus> = { ...initialIsFileStatuses };
    let criteriaFile: File | null = null;
    let mainDataFile: File | null = null;

    files.forEach(file => {
      const lowerCaseName = file.name.toLowerCase();
      if (lowerCaseName.includes(isFileConfig.criteria.keyword)) {
        criteriaFile = file;
      } else if (lowerCaseName.includes(isFileConfig.mainData.keyword)) {
        mainDataFile = file;
      }
    });

    if (!criteriaFile || !mainDataFile) {
      setError(t('app.errors.isFileIdentification'));
      setIsProcessing(false);
      setIsFileStatuses({
        criteria: { status: 'error', fileName: null, error: !criteriaFile ? t('app.errors.missing') : null },
        mainData: { status: 'error', fileName: null, error: !mainDataFile ? t('app.errors.missing') : null },
      });
      return;
    }

    const criteriaPromise = processIncentiveCriteriaFile(criteriaFile)
      .then(data => {
        setCriteriaData(data);
        newStatuses.criteria = { status: 'success', fileName: criteriaFile!.name, error: null };
      })
      .catch(err => {
        const msg = err instanceof Error ? t(err.message) : t('app.errors.processingFailed');
        newStatuses.criteria = { status: 'error', fileName: criteriaFile!.name, error: msg };
      });

    const mainDataPromise = processMainDataFile(mainDataFile, 'INCENTIVE_STAFF')
      .then(data => {
        setIsRawData(data);
        newStatuses.mainData = { status: 'success', fileName: mainDataFile!.name, error: null };
      })
      .catch(err => {
        const msg = err instanceof Error ? t(err.message) : t('app.errors.processingFailed');
        newStatuses.mainData = { status: 'error', fileName: mainDataFile!.name, error: msg };
      });

    await Promise.allSettled([criteriaPromise, mainDataPromise]);
    setIsFileStatuses(newStatuses);

    if (newStatuses.criteria.status !== 'success' || newStatuses.mainData.status !== 'success') {
      setError(t('app.errors.fileProcessFailed'));
    }

    setIsProcessing(false);
  }, [t]);

  const handleIsbFilesProcess = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    resetAllFileUploadStates();
    setError(null);

    if (files.length !== 2) {
      setError(t('app.errors.isIncorrectFileCount'));
      setIsProcessing(false);
      const errorStatus = { status: 'error' as const, fileName: null, error: t('app.errors.isIncorrectFileCountStatus') };
      setIsFileBolltechStatuses({ criteriaBolltech: errorStatus, mainData: errorStatus });
      return;
    }

    const newStatuses: Record<IsbFileKey, FileStatus> = { ...initialIsbFileStatuses };
    let criteriaFile: File | null = null;
    let mainDataFile: File | null = null;

    files.forEach(file => {
      const lowerCaseName = file.name.toLowerCase();
      if (lowerCaseName.includes(isbFileConfig.criteriaBolltech.keyword)) {
        criteriaFile = file;
      } else if (lowerCaseName.includes(isbFileConfig.mainData.keyword)) {
        mainDataFile = file;
      }
    });

    if (!criteriaFile || !mainDataFile) {
      setError(t('app.errors.isFileIdentification'));
      setIsProcessing(false);
      setIsFileBolltechStatuses({
        criteriaBolltech: { status: 'error', fileName: null, error: !criteriaFile ? t('app.errors.missing') : null },
        mainData: { status: 'error', fileName: null, error: !mainDataFile ? t('app.errors.missing') : null },
      });
      return;
    }

    const criteriaPromise = processBolltechIncentiveCriteriaFile(criteriaFile)
      .then(data => {
        setBolltechCriteriaData(data);
        newStatuses.criteriaBolltech = { status: 'success', fileName: criteriaFile!.name, error: null };
      })
      .catch(err => {
        const msg = err instanceof Error ? t(err.message) : t('app.errors.processingFailed');
        newStatuses.criteriaBolltech = { status: 'error', fileName: criteriaFile!.name, error: msg };
      });

    const mainDataPromise = processMainDataFile(mainDataFile, 'INCENTIVE_STAFF')
      .then(data => {
        setIsRawData(data);
        newStatuses.mainData = { status: 'success', fileName: mainDataFile!.name, error: null };
      })
      .catch(err => {
        const msg = err instanceof Error ? t(err.message) : t('app.errors.processingFailed');
        newStatuses.mainData = { status: 'error', fileName: mainDataFile!.name, error: msg };
      });

    await Promise.allSettled([criteriaPromise, mainDataPromise]);
    setIsFileBolltechStatuses(newStatuses);

    if (newStatuses.criteriaBolltech.status !== 'success' || newStatuses.mainData.status !== 'success') {
      setError(t('app.errors.fileProcessFailed'));
    }

    setIsProcessing(false);

  }, [t]);


  const generateReport = useCallback((
    reportType: ReportType,
    processors: {
      fifo?: () => FifoMistakeReportPayload,
      staffFifo?: () => StaffMistakeReportPayload,
      tg?: () => TransferGoodsReportPayload,
      dt?: () => DepositToolsData[],
      rs?: () => RevenueStaffRow[],
      is?: () => IncentiveStaffRow[],
    }) => {
    setIsLoading(true);
    setError(null);
    setReportData([]);
    setAmSummaryData([]);
    setFifoSummaries([]);
    setUnderperformedData(null);
    setResumeData(null);
    setStaffFifoDateRange(null);

    try {
      // ...
      // ... (skipping context match for brevity if precise lines are known, but here we are replacing a block to add setStaffFifoDateRange(null) back)
      // Check step 257 content 'setResumeData(null);'. We need to add 'setStaffFifoDateRange(null);' after it.
      // And checking for useEffect logic separately might be better.

      let result: any;
      if (reportType === 'FIFO' && processors.fifo) {
        result = processors.fifo();
        setReportData(result.data);
        setFifoSummaries(result.summaries);
        setUnderperformedData(result.underperformedData);
        setResumeData(result.resumeData);
        setFileName('FIFO_Report');
        // Persist Store FIFO Data
        setStoreFifoData({
          data: result.data,
          summaries: result.summaries,
          underperformedData: result.underperformedData,
          resumeData: result.resumeData
        });
      } else if (reportType === 'FIFO' && processors.staffFifo) {
        result = processors.staffFifo();
        setReportData(result.data);
        setStaffFifoDateRange({ min: result.minDate, max: result.maxDate });
        setFileName('Staff_FIFO_Mistake_Report');
        // Persist Staff FIFO Data
        setStaffFifoData({
          data: result.data,
          dateRange: { min: result.minDate, max: result.maxDate }
        });
      } else if (reportType === 'TRANSFER_GOODS' && processors.tg) {
        result = processors.tg();
        setReportData(result.data);
        setAmSummaryData(result.summary);
        setFileName('Transfer_Goods_Report');
      } else if (reportType === 'DEPOSIT_TOOLS' && processors.dt) {
        result = processors.dt();
        setReportData(result);
        setFileName('Deposit_Tools_Report');
      } else if (reportType === 'REVENUE_STAFF' && processors.rs) {
        result = processors.rs();
        setReportData(result);
        setFileName('Revenue_Staff_Report');
      } else if (reportType === 'INCENTIVE_STAFF' && processors.is) {
        result = processors.is();
        setReportData(result);
        setFileName('Incentive_Staff_Report');
      }

      if (!result || (Array.isArray(result) && result.length === 0) || (result.data && result.data.length === 0)) {
        setError(t('app.errors.noRecords'));
      }
    } catch (err) {
      setError(err instanceof Error ? t(err.message) : t('app.errors.unknownError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (reportType === 'FIFO' && fifoSubType === 'STORE' && amData && phoneData && tabletData && tvData && speakerData) {
      // Detail files are now optional. If they are missing, we pass empty objects/nulls which the service handles.
      // However, to keep the service signature clean, we can pass empty arrays if data is missing, 
      // OR we can pass the state as is (which might be null) and let the service handle it.
      // Looking at the service signature: detailSheets: { phone: {dataRows...}, ... }
      // We should construct the detailSheets object carefully.

      const detailSheets = {
        phone: detailPhoneData || { dataRows: [], headers: [] },
        tablet: detailTabletData || { dataRows: [], headers: [] },
        tv: detailTvData || { dataRows: [], headers: [] },
        speaker: detailSpeakerData || { dataRows: [], headers: [] }
      };

      generateReport('FIFO', {
        fifo: () => processFifoMistake(
          { phone: phoneData, tablet: tabletData, tv: tvData, speaker: speakerData },
          amData,
          detailSheets
        )
      });
    }
  }, [reportType, fifoSubType, amData, phoneData, tabletData, tvData, speakerData, detailPhoneData, detailTabletData, detailTvData, detailSpeakerData, generateReport]);

  useEffect(() => {
    if (reportType === 'FIFO' && fifoSubType === 'STAFF' && salesData && detailPhoneData && detailTabletData && detailTvData && detailSpeakerData && amData) { // Added amData check
      const detailSheets = {
        phone: detailPhoneData,
        tablet: detailTabletData,
        tv: detailTvData,
        speaker: detailSpeakerData
      };

      generateReport('FIFO', {
        staffFifo: () => processStaffFifoMistake(
          salesData,
          detailSheets,
          amData
        )
      });
    }
  }, [reportType, fifoSubType, salesData, detailPhoneData, detailTabletData, detailTvData, detailSpeakerData, amData, generateReport]);



  useEffect(() => {
    if (reportType === 'TRANSFER_GOODS' && amData && tgRawData) {
      generateReport('TRANSFER_GOODS', { tg: () => processTransferGoods(tgRawData.dataRows, tgRawData.headers, amData) });
    }
  }, [reportType, amData, tgRawData, generateReport]);



  useEffect(() => {
    if (reportType === 'REVENUE_STAFF' && rsRawData.length === 6 && staffInfoData) {
      generateReport('REVENUE_STAFF', { rs: () => processRevenueStaff(rsRawData, staffInfoData) });
    }
  }, [reportType, rsRawData, staffInfoData, generateReport]);

  useEffect(() => {
    if (reportType === 'INCENTIVE_STAFF') {
      if (incentiveSubType === 'STANDARD' && criteriaData && isRawData) {
        generateReport('INCENTIVE_STAFF', { is: () => processIncentiveStaff(isRawData.dataRows, isRawData.headers, criteriaData) });
      } else if (incentiveSubType === 'BOLLTECH' && bolltechCriteriaData && isRawData) {
        setIsLoading(true);
        setError(null);
        setReportData([]);
        try {
          const result = processIncentiveStaffBolltech(isRawData.dataRows, isRawData.headers, bolltechCriteriaData);
          setReportData(result);
          setFileName('Incentive_Staff_Bolltech_Report');
          if (result.length === 0) {
            setError(t('app.errors.noRecords'));
          }
        } catch (err) {
          setError(err instanceof Error ? t(err.message) : t('app.errors.unknownError'));
        } finally {
          setIsLoading(false);
        }
      }
    }
  }, [reportType, incentiveSubType, criteriaData, bolltechCriteriaData, isRawData, generateReport, t]);


  const handleSingleFileProcess = useCallback(async (file: File) => {
    // This handler is now only for SO_NOT_EXPORT
    setIsLoading(true);
    setError(null);
    setReportData([]);
    setFileName(file.name);

    try {
      const { dataRows, headers } = await processMainDataFile(file, 'SO_NOT_EXPORT');
      const result = processSoNotExport(dataRows, headers);
      setReportData(result);
      if (result.length === 0) {
        setError(t('app.errors.noRecordsInFile'));
      }
    } catch (err) {
      setError(err instanceof Error ? t(err.message) : t('app.errors.unknownErrorProcessingFile'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const handleReportTypeChange = (newType: ReportType) => {
    if (newType !== reportType) {
      setReportType(newType);
      setReportData([]);
      setAmSummaryData([]);
      setFifoSummaries([]);
      setUnderperformedData(null);
      setResumeData(null);
      setError(null);
      setFileName(null);
      resetAllFileUploadStates();
      if (newType !== 'INCENTIVE_STAFF') {
        setIncentiveSubType('STANDARD');
      }
      if (newType !== 'FIFO') {
        setFifoSubType('STORE');
      }
    }
  };

  const handleIncentiveSubTypeChange = (subType: 'STANDARD' | 'BOLLTECH') => {
    if (subType !== incentiveSubType) {
      setIncentiveSubType(subType);
      setReportData([]);
      setError(null);
      setFileName(null);
      setIsRawData(null);
      setCriteriaData(null);
      setBolltechCriteriaData(null);
      setIsFileStatuses(initialIsFileStatuses);
      setIsFileBolltechStatuses(initialIsbFileStatuses);
    }
  };

  const handleFifoSubTypeChange = (subType: 'STORE' | 'STAFF') => {
    if (subType !== fifoSubType) {
      setFifoSubType(subType);

      if (subType === 'STORE') {
        if (storeFifoData) {
          // Restore Store Data
          setReportData(storeFifoData.data);
          setFifoSummaries(storeFifoData.summaries);
          setUnderperformedData(storeFifoData.underperformedData);
          setResumeData(storeFifoData.resumeData);
          setFileName('FIFO_Report');
          setStaffFifoDateRange(null);
          // Keep persistent file statuses if possible, or just don't clear them?
          // Since we cleared them on switching away previously, we might have lost them.
          // But now we want to PERSIST. So we should NOT clear them when switching away?
          // For now, restoring the data result is enough. Files might need re-upload if we clear them.
          // Let's TRY not clearing files on switch.
        } else {
          setReportData([]);
          setFifoSummaries([]);
          setUnderperformedData(null);
          setResumeData(null);
          setFileName(null);
          setAmData(null);
          setPhoneData(null);
          setTabletData(null);
          setTvData(null);
          setSpeakerData(null);
          setDetailPhoneData(null);
          setDetailTabletData(null);
          setDetailTvData(null);
          setDetailSpeakerData(null);
          setFifoFileStatuses(initialFifoFileStatuses);
        }
      } else {
        if (staffFifoData) {
          // Restore Staff Data
          setReportData(staffFifoData.data);
          setStaffFifoDateRange(staffFifoData.dateRange);
          setFileName('Staff_FIFO_Mistake_Report');
          setFifoSummaries([]);
          setUnderperformedData(null);
          setResumeData(null);
        } else {
          setReportData([]);
          setStaffFifoDateRange(null);
          setFileName(null);
          setAmData(null);
          setSalesData(null);
          setDetailPhoneData(null);
          setDetailTabletData(null);
          setDetailTvData(null);
          setDetailSpeakerData(null);
          setStaffFifoFileStatuses(initialStaffFifoFileStatuses);
        }
      }
    }
  };

  const renderSubTypeSelectors = () => {
    if (reportType === 'FIFO') {
      return (
        <div className="bg-slate-200 p-1 rounded-lg inline-flex flex-wrap gap-1 mb-6">
          <button
            onClick={() => handleFifoSubTypeChange('STORE')}
            className={`text-center px-4 py-2 font-semibold text-sm rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-200 focus:ring-blue-500 ${fifoSubType === 'STORE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}
          >
            {t('app.buttons.storeFifoMistake')}
          </button>
          <button
            onClick={() => handleFifoSubTypeChange('STAFF')}
            className={`text-center px-4 py-2 font-semibold text-sm rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-200 focus:ring-blue-500 ${fifoSubType === 'STAFF' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}
          >
            {t('app.buttons.staffFifoMistake')}
          </button>
        </div>
      );
    }
    if (reportType === 'INCENTIVE_STAFF') {
      return (
        <div className="bg-slate-200 p-1 rounded-lg inline-flex flex-wrap gap-1 mb-6">
          <button
            onClick={() => handleIncentiveSubTypeChange('STANDARD')}
            className={`text-center px-4 py-2 font-semibold text-sm rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-200 focus:ring-blue-500 ${incentiveSubType === 'STANDARD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}
          >
            {t('app.buttons.incentiveStaffStandard')}
          </button>
          <button
            onClick={() => handleIncentiveSubTypeChange('BOLLTECH')}
            className={`text-center px-4 py-2 font-semibold text-sm rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-200 focus:ring-blue-500 ${incentiveSubType === 'BOLLTECH' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}
          >
            {t('app.buttons.incentiveStaffBolltech')}
          </button>
        </div>
      );
    }
    return null;
  };

  const renderFileUpload = () => {
    switch (reportType) {
      case 'FIFO':
        return fifoSubType === 'STORE' ? (
          <MultiFileUpload
            onFilesProcess={handleFifoFilesProcess}
            isLoading={isProcessing}
            statuses={fifoFileStatuses}
            fileConfig={fifoFileConfig}
            title={t('fileUpload.fifo.title')}
            description={t('fileUpload.fifo.description')}
          />
        ) : (
          <MultiFileUpload
            onFilesProcess={handleStaffFifoFilesProcess}
            isLoading={isProcessing}
            statuses={staffFifoFileStatuses}
            fileConfig={staffFifoFileConfig}
            title={t('fileUpload.staffFifo.title')}
            description={t('fileUpload.staffFifo.description')}
          />
        );
      case 'TRANSFER_GOODS':
        return <MultiFileUpload
          onFilesProcess={handleTgFilesProcess}
          isLoading={isProcessing}
          statuses={tgFileStatuses}
          fileConfig={tgFileConfig}
          title={t('fileUpload.transferGoods.title')}
          description={t('fileUpload.transferGoods.description')}
        />;
      case 'DEPOSIT_TOOLS':
        return <MultiFileUpload
          onFilesProcess={handleDtFilesProcess}
          isLoading={isProcessing}
          statuses={dtFileStatuses}
          fileConfig={dtFileConfig}
          title={t('fileUpload.depositTools.title')}
          description={t('fileUpload.depositTools.description')}
        />;
      case 'REVENUE_STAFF':
        return <MultiFileUpload
          onFilesProcess={handleRsFilesProcess}
          isLoading={isProcessing}
          statuses={rsFileStatuses}
          fileConfig={rsFileConfig}
          title={t('fileUpload.revenueStaff.title')}
          description={t('fileUpload.revenueStaff.description')}
        />;
      case 'INCENTIVE_STAFF':
        return incentiveSubType === 'STANDARD' ? (
          <MultiFileUpload
            onFilesProcess={handleIsFilesProcess}
            isLoading={isProcessing}
            statuses={isFileStatuses}
            fileConfig={isFileConfig}
            title={t('fileUpload.incentiveStaff.title')}
            description={t('fileUpload.incentiveStaff.description')}
          />
        ) : (
          <MultiFileUpload
            onFilesProcess={handleIsbFilesProcess}
            isLoading={isProcessing}
            statuses={isFileBolltechStatuses}
            fileConfig={isbFileConfig}
            title={t('fileUpload.incentiveStaffBolltech.title')}
            description={t('fileUpload.incentiveStaffBolltech.description')}
          />
        );
      case 'SO_NOT_EXPORT':
      default:
        return <div className="space-y-2">
          <h3 className="font-semibold text-slate-600">{t('fileUpload.soNotExport.title')}</h3>
          <FileUpload onFileProcess={handleSingleFileProcess} isLoading={isLoading} />
        </div>;
    }
  };

  const getHeaderTitle = () => {
    if (!isLimitedView) return 'Optimization Report';

    switch (reportType) {
      case 'FIFO': return t('app.buttons.fifo');
      case 'TRANSFER_GOODS': return t('app.buttons.transferGoods');
      case 'DEPOSIT_TOOLS': return t('app.buttons.depositTools');
      case 'REVENUE_STAFF': return t('app.buttons.revenueStaff');
      case 'INCENTIVE_STAFF': return t('app.buttons.incentiveStaff');
      case 'SO_NOT_EXPORT': return t('app.buttons.soNotExport');
      default: return 'Optimization Report';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar activeReport={reportType} onSelectReport={handleReportTypeChange} isLimitedView={isLimitedView} />
      <main className="flex-1 ml-64 bg-slate-50 min-h-screen">
        <Header title={getHeaderTitle()} />
        <div className="p-8 flex-1 overflow-y-auto">

          {renderSubTypeSelectors()}


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              {renderFileUpload()}
              <InstructionCard reportType={reportType} fifoSubType={fifoSubType} />
              {/* Manual Input Removed as requested by User */}
            </div>
            <div className="lg:col-span-2">

              <div className="bg-white rounded-xl shadow-lg p-6 min-h-[400px] flex flex-col border border-slate-100">
                {isLoading || isProcessing ? (
                  <div className="flex-grow flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : error ? (
                  <div className="flex-grow flex items-center justify-center text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                      <strong className="font-bold">{t('app.errorLabel')}: </strong>
                      <span className="block sm:inline">{error}</span>
                    </div>
                  </div>
                ) : reportData.length > 0 ? (
                  <ReportTable orders={reportData} fileName={fileName} reportType={reportType} fifoSubType={fifoSubType} summaryData={amSummaryData} fifoSummaries={fifoSummaries} underperformedData={underperformedData} resumeData={resumeData} staffFifoDateRange={staffFifoDateRange} isLimitedView={isLimitedView} />
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" />
                    </svg>
                    <p className="font-semibold">{t('app.noReport.title')}</p>
                    <p className="text-sm">{t('app.noReport.description')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;