import React from 'react';
import { ReportType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface InstructionCardProps {
    reportType: ReportType;
    fifoSubType?: 'STORE' | 'STAFF';
}

const InstructionCard: React.FC<InstructionCardProps> = ({ reportType, fifoSubType }) => {
  const { t } = useLanguage();

  const getInstructions = (type: ReportType) => {
    switch (type) {
      case 'SO_NOT_EXPORT':
        return (
          <>
            <p>{t('instructions.soNotExport.p1')}</p>
            <div>
              <p className="font-semibold mb-1">{t('instructions.soNotExport.rules.title')}</p>
              <p>{t('instructions.soNotExport.rules.intro')}</p>
              <ol className="list-decimal list-inside mt-2 space-y-3 pl-4">
                <li>{t('instructions.soNotExport.rules.rule1')}</li>
                <li>{t('instructions.soNotExport.rules.rule2.text')}
                  <ul className="list-disc list-inside mt-2 space-y-1 pl-5">
                    <li><code className="bg-blue-50 text-slate-800 font-mono text-xs px-2 py-1 rounded">{t('instructions.soNotExport.rules.rule2.option1')}</code></li>
                    <li><code className="bg-blue-50 text-slate-800 font-mono text-xs px-2 py-1 rounded">{t('instructions.soNotExport.rules.rule2.option2')}</code></li>
                  </ul>
                </li>
              </ol>
            </div>
          </>
        );
      case 'TRANSFER_GOODS':
        return (
          <>
            <p>{t('instructions.transferGoods.p1')}</p>
            <div>
              <p className="font-semibold mb-1">{t('instructions.process')}:</p>
              <ol className="list-decimal list-inside mt-2 space-y-2">
                <li>{t('instructions.transferGoods.process.step1')}</li>
                <li>{t('instructions.transferGoods.process.step2')}</li>
              </ol>
            </div>
            <div>
              <p className="font-semibold mt-4 mb-1">{t('instructions.filteringRule')}:</p>
              <p>{t('instructions.transferGoods.rule')}</p>
            </div>
            <div>
              <p className="font-semibold mt-4 mb-1">{t('instructions.newColumns')}:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 pl-5">
                <li>{t('instructions.transferGoods.columns.dateFromTransfer')}</li>
                <li>{t('instructions.transferGoods.columns.amStores')}</li>
                <li>{t('instructions.transferGoods.columns.cities')}</li>
              </ul>
            </div>
          </>
        );
      case 'DEPOSIT_TOOLS':
        return (
          <>
            <p>{t('instructions.depositTools.p1')}</p>
            <div>
              <p className="font-semibold mb-1 mt-4">{t('instructions.process')}:</p>
              <ol className="list-decimal list-inside mt-2 space-y-2 pl-4">
                <li>{t('instructions.depositTools.process.step1')}</li>
                <li>{t('instructions.depositTools.process.step2')}</li>
              </ol>
            </div>
            <div>
              <p className="font-semibold mb-1 mt-4">{t('instructions.filteringRules')}:</p>
              <ol className="list-decimal list-inside mt-2 space-y-2 pl-4">
                <li>{t('instructions.depositTools.rules.rule1.text1')}<code className="bg-blue-50 text-slate-800 font-mono text-xs px-2 py-1 rounded mx-1">{t('instructions.depositTools.rules.rule1.code')}</code>{t('instructions.depositTools.rules.rule1.text2')}</li>
                <li>{t('instructions.depositTools.rules.rule2')}</li>
                <li>{t('instructions.depositTools.rules.rule3')}</li>
              </ol>
            </div>
            <div>
              <p className="font-semibold mt-4 mb-1">{t('instructions.updatedColumns')}:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 pl-5">
                <li>{t('instructions.depositTools.columns.checkDay')}</li>
                <li>{t('instructions.depositTools.columns.am')}</li>
              </ul>
            </div>
          </>
        );
      case 'FIFO':
        if (fifoSubType === 'STAFF') {
          return (
             <>
              <p>{t('instructions.staffFifoMistake.p1')}</p>
              <div>
                <p className="font-semibold mb-1 mt-4">{t('instructions.process')}:</p>
                <ol className="list-decimal list-inside mt-2 space-y-2">
                  <li>{t('instructions.staffFifoMistake.process.step1')}</li>
                  <li>{t('instructions.staffFifoMistake.process.step2')}</li>
                  <li>{t('instructions.staffFifoMistake.process.step3')}</li>
                  <li>{t('instructions.staffFifoMistake.process.step4')}</li>
                </ol>
              </div>
              <div>
                <p className="font-semibold mb-1 mt-4">{t('instructions.filteringRule')}:</p>
                <p>{t('instructions.staffFifoMistake.rule')}</p>
              </div>
            </>
          );
        }
        return (
          <>
            <p>{t('instructions.fifo.p1')}</p>
            <div>
              <p className="font-semibold mb-1 mt-4">{t('instructions.process')}:</p>
              <ol className="list-decimal list-inside mt-2 space-y-2">
                <li>{t('instructions.fifo.process.step1')}</li>
                <li>{t('instructions.fifo.process.step2')}</li>
                <li>{t('instructions.fifo.process.step3')}</li>
                <li>{t('instructions.fifo.process.step4')}</li>
                <li>{t('instructions.fifo.process.step5')}</li>
                <li>{t('instructions.fifo.process.step6')}</li>
              </ol>
            </div>
            <div>
              <p className="font-semibold mb-1 mt-4">{t('instructions.filteringRule')}:</p>
              <p>{t('instructions.fifo.rule')}</p>
            </div>
          </>
        );
      case 'REVENUE_STAFF':
        return (
          <>
            <p>{t('instructions.revenueStaff.p1')}</p>
            <div>
              <p className="font-semibold mb-1 mt-4">{t('instructions.process')}:</p>
              <ol className="list-decimal list-inside mt-2 space-y-2">
                <li>{t('instructions.revenueStaff.process.step1')}</li>
                <li>{t('instructions.revenueStaff.process.step2')}</li>
                <li>{t('instructions.revenueStaff.process.step3')}</li>
                <li>{t('instructions.revenueStaff.process.step4')}</li>
              </ol>
            </div>
            <div>
              <p className="font-semibold mb-1 mt-4">{t('instructions.reportDetails')}:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 pl-5">
                <li>{t('instructions.revenueStaff.details.detail1')}</li>
                <li>{t('instructions.revenueStaff.details.detail2')}</li>
                <li>{t('instructions.revenueStaff.details.detail3')}</li>
              </ul>
            </div>
          </>
        );
      case 'INCENTIVE_STAFF':
        // This will now show a generic message, and the specific instructions will be based on the sub-type chosen in App.tsx
        return (
          <>
             <p>{t('instructions.incentiveStaffBolltech.p1')}</p>
            <div>
              <p className="font-semibold mb-1 mt-4">{t('instructions.process')}:</p>
              <ol className="list-decimal list-inside mt-2 space-y-2">
                <li>{t('instructions.incentiveStaffBolltech.process.step1')}</li>
                <li>{t('instructions.incentiveStaffBolltech.process.step2')}</li>
              </ol>
            </div>
            <div>
              <p className="font-semibold mb-1 mt-4">{t('instructions.reportDetails')}:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 pl-5">
                <li>{t('instructions.incentiveStaffBolltech.details.detail1')}</li>
                <li>{t('instructions.incentiveStaffBolltech.details.detail2')}</li>
                <li>{t('instructions.incentiveStaffBolltech.details.detail3')}</li>
              </ul>
            </div>
            <hr className="my-4"/>
             <p>{t('instructions.incentiveStaff.p1')}</p>
            <div>
              <p className="font-semibold mb-1 mt-4">{t('instructions.process')}:</p>
              <ol className="list-decimal list-inside mt-2 space-y-2">
                <li>{t('instructions.incentiveStaff.process.step1')}</li>
                <li>{t('instructions.incentiveStaff.process.step2')}</li>
              </ol>
            </div>
            <div>
              <p className="font-semibold mb-1 mt-4">{t('instructions.reportDetails')}:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 pl-5">
                <li>{t('instructions.incentiveStaff.details.detail1')}</li>
                <li>{t('instructions.incentiveStaff.details.detail2')}</li>
                <li>{t('instructions.incentiveStaff.details.detail3')}</li>
              </ul>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-blue-100 rounded-full mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-700">{t('instructions.title')}</h3>
      </div>
      <div className="space-y-4 text-sm text-slate-600">
        {getInstructions(reportType)}
        <p className="pt-2 border-t border-slate-200 mt-4">{t('instructions.footer')}</p>
      </div>
    </div>
  );
};

export default InstructionCard;