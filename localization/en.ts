const en = {
  header: {
    title: "Yusuf Adi Pratama - Optimization Report"
  },
  app: {
    selectReportTitle: "Select Report Type",
    selectReportDescription: "Choose which report you would like to generate.",
    errorLabel: "Error",
    buttons: {
      soNotExport: "SO Not Export",
      transferGoods: "Transfer Goods",
      depositTools: "Deposit Tools",
      fifo: "FIFO Report",
      revenueStaff: "Revenue Staff",
      incentiveStaff: "Incentive Staff",
      incentiveStaffStandard: "Standard",
      incentiveStaffBolltech: "Bolltech",
      mainReport: "Main Report",
      underperformed: "Underperformed",
      resume: "Resume FIFO Mistake",
      storeFifoMistake: "Store Mistake",
      staffFifoMistake: "Staff Mistake",
    },
    noReport: {
      title: "No report generated yet.",
      description: "Please upload the required file(s) to begin."
    },
    errors: {
      noRecords: "No matching records found based on the report criteria.",
      noRecordsInFile: "No matching records found in the file based on the criteria for this report type.",
      unknownError: "An unknown error occurred during report generation.",
      unknownErrorProcessingFile: "An unknown error occurred while processing the file.",
      processingFailed: "Processing failed.",
      fileProcessFailed: "One or more files failed to process. Please check statuses.",
      rsIncorrectFileCount: "Please upload exactly 7 files: 6 for monthly revenue and 1 for staff info.",
      rsIncorrectFileCountStatus: "Incorrect number of files uploaded.",
      rsFileIdentification: "Could not identify files. Please ensure the staff info filename contains 'staff' and there are 6 monthly files.",
      isIncorrectFileCount: "Please upload exactly 2 files: 1 for criteria and 1 for main data.",
      isIncorrectFileCountStatus: "Incorrect number of files uploaded.",
      isFileIdentification: "Could not identify files. Ensure criteria file has 'criteria' and main data file has 'data' in their names.",
      missing: "Missing",
      incorrectCount: "Incorrect count",
    }
  },
  fileUpload: {
    clickToUpload: "Click to upload",
    dragAndDrop: "or drag and drop.",
    fileTypes: "XLSX or XLS files only",
    processing: "Processing...",
    disabled: "Please upload AM file first.",
    statusTitle: "Required Files Status:",
    fileNameLabel: "File",
    soNotExport: {
      title: "Upload Main Data",
    },
    fifo: {
      title: "Upload Store FIFO Report Files",
      description: "Drop all 9 files at once. The app will identify them by name."
    },
    staffFifo: {
      title: "Upload Staff FIFO Mistake Files",
      description: "Drop all 6 required files. The app will identify them by name (Sales data must contain 'penjualan')."
    },
    transferGoods: {
      title: "Upload Transfer Goods Files",
      description: "Drop the AM Data and Transfer Goods files. The app will identify them."
    },
    depositTools: {
      title: "Upload Deposit Tools Files",
      description: "Drop the AM Data and Deposit Tools files. The app will identify them."
    },
    revenueStaff: {
        title: "Upload Staff Revenue Files",
        description: "Drop the Staff Info file and 6 monthly data files. Staff file must contain 'staff' in name."
    },
    incentiveStaff: {
      title: "Upload Staff Incentive Files",
      description: "Drop the criteria file (name must include 'criteria') and the main sales data file (name must include 'data')."
    },
    incentiveStaffBolltech: {
      title: "Upload Bolltech Incentive Files",
      description: "Drop the Bolltech criteria file (name must include 'bolltech') and the main sales data file."
    },
  },
  fileLabels: {
    am: "AM Data",
    phone: "Phone Data",
    tablet: "Tablet Data",
    tv: "TV Data",
    speaker: "Speaker Data",
    detailPhone: "Detail FIFO Phone",
    detailTablet: "Detail FIFO Tablet",
    detailTv: "Detail FIFO TV",
    detailSpeaker: "Detail FIFO Speaker",
    salesData: "Sales Data",
    transferGoods: "Transfer Goods Data",
    depositTools: "Deposit Tools Data",
    staffInfo: "Staff Info Data",
    month1: "Month 1 Data",
    month2: "Month 2 Data",
    month3: "Month 3 Data",
    month4: "Month 4 Data",
    month5: "Month 5 Data",
    month6: "Month 6 Data",
    criteria: "Incentive Criteria",
    criteriaBolltech: "Bolltech Criteria",
    mainData: "Main Sales Data",
  },
  instructions: {
    title: "How It Works",
    process: "Process",
    filteringRule: "Filtering Rule",
    filteringRules: "Filtering Rules",
    newColumns: "New Columns",
    updatedColumns: "New/Updated Columns",
    reportDetails: "Report Details",
    footer: "Please ensure your uploaded Excel file(s) contain the required columns for the report to be generated correctly.",
    soNotExport: {
      p1: "This tool filters sales orders to find items that have been paid for but not yet exported from the system.",
      rules: {
        title: "Filtering Rules:",
        intro: "The report will only include rows that meet the following criteria:",
        rule1: "The \"Delivery date\" has already passed (is earlier than the date you upload the file). Rows with a delivery date of today or in the future will be excluded.",
        rule2: {
          text: "The \"Type of export request\" column is one of the following:",
          option1: "ERABLUE- Sales at Store",
          option2: "ERABLUE- Sales Delivery at home"
        }
      }
    },
    transferGoods: {
      p1: "This report identifies goods transfers that are overdue for receipt by the destination store.",
      process: {
        step1: "Upload an Excel file containing Area Manager (AM) data. This file must have \"Store Code\", \"AM Name\", and \"City\" columns.",
        step2: "Upload your main Transfer Goods data file."
      },
      rule: "The report will only show transfers where the \"Transfer Store Date\" is more than 7 days in the past.",
      columns: {
        dateFromTransfer: "\"Date From Transfer\": Calculated as Today's Date minus the Transfer Store Date.",
        amStores: "\"AM Output/Input Store\": Populated by matching the store code from your main file with the AM data file.",
        cities: "\"Output/Input City\": Populated by matching the store code with the AM data file."
      }
    },
    depositTools: {
      p1: "This report identifies manual sales deposits that are overdue and flags potential duplicates by using AM data.",
      process: {
        step1: "Upload an Excel file containing Area Manager (AM) data. This file must have \"Store Code\" and \"AM Name\" columns.",
        step2: "Upload your main Deposit Tools data file."
      },
      rules: {
        rule1: {
          text1: "Includes rows where \"Voucher type\" is ",
          code: "Erablue - Collecting sales deposits",
          text2: " AND the \"Invoucher date\" is more than 3 days ago."
        },
        rule2: "It then checks this list against the entire original file to find unique transactions. A transaction is considered unique if the combination of \"Customer name\" and \"Payment amount\" (ignoring negative signs) appears only once in the whole file. This step effectively removes \"Collecting\" deposits that have a corresponding \"Refund\" transaction.",
        rule3: "Finally, the report will only include entries where the calculated \"Check Day\" is less than 60 days."
      },
      columns: {
        checkDay: "\"Check Day\": Calculated as Today's Date minus the Invoucher Date.",
        am: "\"AM\": Populated by matching the store code from your main file with the uploaded AM data file."
      }
    },
    fifo: {
      p1: "This report analyzes FIFO process mistakes by category (Phone, Tablet, TV, Speaker) for stores that have passed their Grand Opening date.",
      process: {
        step1: "Upload the Area Manager (AM) data file. Important: This file must contain the columns 'Store Code', 'Store Name', 'AM Name', and 'G.O'.",
        step2: "Upload the main data file for Phones.",
        step3: "Upload the main data file for Tablets.",
        step4: "Upload the main data file for TVs.",
        step5: "Upload the main data file for Speakers. The report will be generated automatically after all files are provided."
      },
      rule: "The final report will only include stores where the Grand Opening date is in the past."
    },
    staffFifoMistake: {
      p1: "This report identifies the staff member responsible for a FIFO mistake by matching IMEI numbers between detail and sales data.",
      process: {
        step1: "Upload the Area Manager (AM) data file.",
        step2: "Upload the main Sales Data file (must contain 'IMEI', 'Created user', 'Store').",
        step3: "Upload all four FIFO Detail files (Phone, Tablet, TV, Speaker). These must contain 'Sale Date' and 'IMEI'.",
        step4: "The report is generated automatically once all files are provided."
      },
      rule: "A mistake is counted if a row in any Detail file has a date in the 'Sale Date' column. The app then finds the 'Created user' and 'Store' from the Sales Data file using the matching IMEI. The mistake is only included if the 'Store' name from the sales data is also present in the uploaded AM Data file."
    },
     revenueStaff: {
      p1: "This report generates a summary of total revenue per staff member over six months, including performance rankings.",
      process: {
        step1: "Prepare seven separate Excel files: 6 for monthly revenue and 1 for staff master data.",
        step2: "The Staff Info file must contain the columns: 'NO', 'ID Staff', 'Staff Name', and 'Store Name'.",
        step3: "Each monthly revenue file must contain the columns: 'Input User', 'Final Revenue included Return', and 'Output Date'.",
        step4: "Upload all seven files at once. The staff info file must have 'staff' in its name to be identified."
      },
      details: {
        detail1: "It totals the revenue for each unique 'Input User' for each month.",
        detail2: "The top 10% of performers each month receive a star (⭐).",
        detail3: "The bottom 10% of performers each month receive a sad emoji (😕)."
      }
    },
    incentiveStaff: {
      p1: "This report calculates the total incentive earned by each staff member based on product sales within a specific period.",
      process: {
          step1: "Upload the Incentive Criteria file. It must contain columns: 'Product code', 'Start date', 'End date', and 'Incentive / unit'. The filename must include the word 'criteria'.",
          step2: "Upload the main raw sales data file. It must contain 'Product code', 'Sub Category&Brand', 'Create date', and 'Created user'. The filename must include the word 'data'."
      },
      details: {
          detail1: "For each sale in the main data, the app checks if its 'Create date' is within the 'Start date' and 'End date' of any rule in the criteria file.",
          detail2: "It also checks if the sale's 'Product code' or 'Sub Category&Brand' matches the 'Product code' from the same rule.",
          detail3: "If both conditions are met, the specified 'Incentive / unit' is awarded to the 'Created user' (staff). The report then shows the total incentive for each staff member."
      }
    },
    incentiveStaffBolltech: {
      p1: "This report calculates the total Bolltech incentive earned by each staff member.",
      process: {
          step1: "Upload the Bolltech Incentive Criteria file. It must contain: 'Product code + SRP Bolttech', 'Start date', 'End date', and 'Incentive / unit'. The filename must include 'bolltech'.",
          step2: "Upload the main raw sales data file. It must contain 'Product code', 'Sale Price (VAT)', 'Create date', and 'Created user'."
      },
      details: {
          detail1: "For each sale, the app creates a key by combining 'Product code' + 'Sale Price (VAT)'.",
          detail2: "It checks if this key matches a key from the criteria file ('Product code + SRP Bolttech') and if the sale date is within the incentive period.",
          detail3: "If matched, the incentive is awarded. The report shows the total incentive per staff member and a breakdown by each Bolltech product key."
      }
    }
  },
  reports: {
    sourceFile: "Source file",
    totalRecords: "Total matching records: {{count}}",
    downloadExcel: "Download Excel",
    downloadAriaLabel: "Download report as Excel file",
    soNotExport: {
      title: "SO Not Export Report",
      description: "Generate a report of paid sales orders not yet exported from the system."
    },
    transferGoods: {
      title: "Transfer Goods Report",
      description: "Generate a report of goods transfers that are overdue for receipt (> 7 days)."
    },
    depositTools: {
      title: "Deposit Tools Report",
      description: "Generates a report on manual sales deposits older than 3 days with potential duplicates."
    },
    fifo: {
      title: "FIFO Store Mistake Report",
      description: "Calculates total FIFO process mistakes per store, filtered by Grand Opening date.",
      excelTitle: "RESUME MTD FIFO ICT & AV | {{date}}"
    },
    staffFifoMistake: {
      title: "Staff FIFO Mistake Report",
      description: "Identifies staff responsible for FIFO mistakes by matching IMEI from detail and sales files.",
      categoryTitle: "{{category}} Mistakes"
    },
    revenueStaff: {
        title: "Revenue Staff Report",
        description: "Generates a revenue report per staff member over the last six months."
    },
    incentiveStaff: {
      title: "Incentive Staff Report",
      description: "Calculates the total incentive earned by each staff member based on sales criteria."
    },
    incentiveStaffBolltech: {
      title: "Incentive Staff Report (Bolltech)",
      description: "Calculates the total Bolltech incentive earned by each staff member."
    },
    tableHeaders: {
      am: "AM",
      grandTotal: "Grand Total",
      soNotExport: {
        orderCode: "Order Code",
        customerName: "Customer Name",
        createdDate: "Created Date",
        deliveryDate: "Delivery Date",
        outputStore: "Output Store",
        totalAmount: "Total Amount"
      },
      transferGoods: {
        transportVoucher: "Transport voucher",
        outputStore: "Output Store",
        outputCity: "Output City",
        inputStore: "Input Store",
        inputCity: "Input City",
        transferStoreDate: "Transfer Store Date",
        inventoryStatus: "Inventory Status",
        dateFromTransfer: "Date From Transfer",
        amOutputStore: "AM Output Store",
        amInputStore: "AM Input Store"
      },
      depositTools: {
        store: "Store",
        inOutVoucher: "In/out voucher",
        customerName: "Customer name",
        date: "Invoucher date",
        checkDay: "Check Day",
        paymentAmount: "Payment amount",
        content: "Content"
      },
      fifo: {
        no: "NO",
        storeCode: "STORE ID",
        storeName: "Store Name",
        saleOut: "Sale Out",
        mistake: "Mistake",
        percent: "Percent"
      },
      staffFifoMistake: {
        no: "NO",
        staffName: "Staff Name",
        storeName: "Store Name",
        imei: "IMEI",
        date: "Date",
        qty: "QTY"
      },
      revenueStaff: {
        no: "NO",
        inputuser: "Input User",
        staffname: "Staff Name",
        workingstore: "Working Store",
        star: "STAR",
        bottom: "BOTTOM"
      },
      incentiveStaff: {
        staff: "Staff",
        total: "TOTAL",
      }
    }
  }
};

export default en;