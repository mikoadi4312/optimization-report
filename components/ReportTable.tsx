import React from 'react';
import { ReportData, ReportType, SaleOrder, TransferGoodsData, AMSummaryData, DepositToolsData, FifoMistakeRow, FifoWeeklySummary, RevenueStaffRow, IncentiveStaffRow, UnderperformedCategoryData, FifoResumeData } from '../types';

import SoNotExportTable from './reports/SoNotExportTable';
import TransferGoodsTable from './reports/TransferGoodsTable';
import DepositToolsTable from './reports/DepositToolsTable';
import FifoReportTable from './reports/FifoReportTable';
import StaffFifoMistakeTable from './reports/StaffFifoMistakeTable';
import RevenueStaffTable from './reports/RevenueStaffTable';
import IncentiveStaffTable from './reports/IncentiveStaffTable';



interface ReportTableProps {
  orders: ReportData[];
  fileName: string | null;
  reportType: ReportType;
  fifoSubType?: 'STORE' | 'STAFF';
  summaryData?: AMSummaryData[];
  fifoSummaries?: FifoWeeklySummary[];
  underperformedData?: UnderperformedCategoryData | null;
  resumeData?: FifoResumeData | null;
  staffFifoDateRange?: { min: Date | null, max: Date | null } | null;
  isLimitedView?: boolean;
  onClear?: () => void;
}

const ReportTable: React.FC<ReportTableProps> = ({ orders, fileName, reportType, fifoSubType, summaryData, fifoSummaries, underperformedData, resumeData, staffFifoDateRange, isLimitedView = false, onClear }) => {
  // This component now acts as a router, rendering the correct table component based on the reportType.
  // All specific logic for table rendering and Excel downloading has been moved to the individual components.
  switch (reportType) {
    case 'SO_NOT_EXPORT':
      return <SoNotExportTable orders={orders as SaleOrder[]} fileName={fileName} />;
    case 'TRANSFER_GOODS':
      return <TransferGoodsTable orders={orders as TransferGoodsData[]} summaryData={summaryData} fileName={fileName} />;
    case 'DEPOSIT_TOOLS':
      return <DepositToolsTable orders={orders as DepositToolsData[]} fileName={fileName} />;
    case 'FIFO':
      if (fifoSubType === 'STAFF') {
        return (
          <StaffFifoMistakeTable
            orders={orders as any[]}
            dateRange={staffFifoDateRange!}
            onClear={onClear || (() => { })}
          />
        );
      }
      return <FifoReportTable orders={orders as FifoMistakeRow[]} fifoSummaries={fifoSummaries} fileName={fileName} underperformedData={underperformedData} resumeData={resumeData} isLimitedView={isLimitedView} onClear={onClear} />;
    case 'REVENUE_STAFF':
      return <RevenueStaffTable orders={orders as RevenueStaffRow[]} fileName={fileName} />;
    case 'INCENTIVE_STAFF':
      return <IncentiveStaffTable orders={orders as IncentiveStaffRow[]} fileName={fileName} />;
    default:
      // Render nothing if the report type is unknown.
      return null;
  }
};

export default ReportTable;