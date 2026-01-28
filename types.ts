export interface SaleOrder {
  orderCode: string;
  customerName: string;
  createdDate: string;
  deliveryDate: string;
  outputStore: string;
  totalAmount: number;
}

export interface TransferGoodsData {
  transportVoucher: string;
  outputStore: string;
  outputCity: string;
  inputStore: string;
  inputCity: string;
  transferStoreDate: string;
  inventoryStatus: string;
  dateFromTransfer: number;
  amOutputStore: string;
  amInputStore: string;
}

export interface DepositToolsData {
  store: string;
  inOutVoucher: string;
  customerName: string;
  date: string;
  checkDay: number;
  paymentAmount: number;
  content: string;
  am: string;
}

export interface FifoMistakeRow {
  isSummary: boolean;
  no?: number;
  storeId?: string;
  storeName: string;
  am?: string;
  phoneSaleOut: number;
  phoneMistake: number;
  phonePercent: number;
  tabletSaleOut: number;
  tabletMistake: number;
  tabletPercent: number;
  tvSaleOut: number;
  tvMistake: number;
  tvPercent: number;
  speakerSaleOut: number;
  speakerMistake: number;
  speakerPercent: number;
}

export interface StaffMistakeResumeRow {
  no: number;
  am: string;
  storeName: string;
  staffName: string;
  phone: FifoDetailCounts;
  tablet: FifoDetailCounts;
  tv: FifoDetailCounts;
  speaker: FifoDetailCounts;
  total: number;
  totalActualSales: number;
  status: string;
}

export interface RevenueStaffRow {
  'NO': number;
  'Input User': string;
  'Staff Name': string;
  'Working Store': string;
  [key: string]: string | number; // For JAN, JAN STAR, JAN BOTTOM etc.
}

export interface StaffInfo {
  no: number;
  inputUser: string;
  staffName: string;
  workingStore: string;
}

export interface IncentiveCriterion {
  productCode: string;
  startDate: Date;
  endDate: Date;
  incentivePerUnit: number;
}

export interface BolltechIncentiveCriterion {
  combinedKey: string;
  startDate: Date;
  endDate: Date;
  incentivePerUnit: number;
}

export interface IncentiveStaffRow {
  staff: string;
  total: number;
  [productCode: string]: string | number; // Dynamic properties for each product
}


export interface AMSummaryData {
  am: string;
  outputStore: number;
  inputStore: number;
}

export interface TransferGoodsReportPayload {
  data: TransferGoodsData[];
  summary: AMSummaryData[];
}


export interface FifoSummaryRow {
  am: string;
  phoneSaleOut: number;
  phoneMistake: number;
  phonePercent: number;
  tabletSaleOut: number;
  tabletMistake: number;
  tabletPercent: number;
  tvSaleOut: number;
  tvMistake: number;
  tvPercent: number;
  speakerSaleOut: number;
  speakerMistake: number;
  speakerPercent: number;
  totalMistakePercent?: number;
}

export interface FifoWeeklySummary {
  title: string;
  data: FifoSummaryRow[];
}

export interface UnderperformedStoreData {
  storeId: string;
  storeName: string;
  saleOut: number;
  mistake: number;
  percent: number;
}

export interface UnderperformedCategoryData {
  phone: UnderperformedStoreData[];
  tablet: UnderperformedStoreData[];
  tv: UnderperformedStoreData[];
  speaker: UnderperformedStoreData[];
}
export interface FifoDetailCounts {
  saleoutAtSupermarket: number;
  co: number;
  fullExchange: number;
  soReturn: number;
  total: number;
}
export interface FifoResumeData {
  mtdSummary: FifoWeeklySummary | null;
  totalErablue: {
    phone: number;
    tablet: number;
    tv: number;
    speaker: number;
    total: number;
  };
  totalByCategory: {
    phone: FifoDetailCounts;
    tablet: FifoDetailCounts;
    tv: FifoDetailCounts;
    speaker: FifoDetailCounts;
  };
  summary: {
    saleoutAtSupermarket: number;
    co: number;
    fullExchange: number;
    soReturn: number;
    total: number;
  };
}


export interface FifoMistakeReportPayload {
  data: FifoMistakeRow[];
  summaries: FifoWeeklySummary[];
  underperformedData: UnderperformedCategoryData;
  resumeData: FifoResumeData;
}

export interface StaffMistakeReportPayload {
  data: StaffMistakeResumeRow[];
  minDate: Date | null;
  maxDate: Date | null;
}


export interface ProcessedAmData {
  codeToAm: Map<string, string>;
  nameToCode: Map<string, string>;
  codeToName: Map<string, string>;
  codeToCity: Map<string, string>;
  codeToGO: Map<string, Date>;
}

export type FifoFileKey = 'am' | 'phone' | 'tablet' | 'tv' | 'speaker' | 'detailPhone' | 'detailTablet' | 'detailTv' | 'detailSpeaker';
export type StaffFifoFileKey = 'am' | 'salesData' | 'detailPhone' | 'detailTablet' | 'detailTv' | 'detailSpeaker';
export type TgFileKey = 'am' | 'transferGoods';
export type DtFileKey = 'am' | 'depositTools';
export type RsFileKey = 'monthFile1' | 'monthFile2' | 'monthFile3' | 'monthFile4' | 'monthFile5' | 'monthFile6' | 'staffInfo';
export type IsFileKey = 'criteria' | 'mainData';
export type IsbFileKey = 'criteriaBolltech' | 'mainData';


export interface FileStatus {
  status: 'pending' | 'success' | 'error';
  fileName: string | null;
  error: string | null;
}


export type ReportData = SaleOrder | TransferGoodsData | DepositToolsData | FifoMistakeRow | RevenueStaffRow | IncentiveStaffRow | StaffMistakeResumeRow;

export type ReportType = 'SO_NOT_EXPORT' | 'TRANSFER_GOODS' | 'DEPOSIT_TOOLS' | 'FIFO' | 'REVENUE_STAFF' | 'INCENTIVE_STAFF';