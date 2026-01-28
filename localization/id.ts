const id = {
  header: {
    title: "Yusuf Adi Pratama - Optimization Report"
  },
  app: {
    selectReportTitle: "Pilih Jenis Laporan",
    selectReportDescription: "Pilih laporan mana yang ingin Anda buat.",
    errorLabel: "Kesalahan",
    buttons: {
      soNotExport: "SO Belum Ekspor",
      transferGoods: "Transfer Barang",
      depositTools: "Deposit Manual",
      fifo: "Laporan FIFO",
      revenueStaff: "Pendapatan Staf",
      incentiveStaff: "Insentif Staf",
      incentiveStaffStandard: "Standar",
      incentiveStaffBolltech: "Bolltech",
      mainReport: "Laporan Utama",
      underperformed: "Kinerja Kurang",
      resume: "Resume Kesalahan FIFO",
      storeFifoMistake: "Kesalahan Toko",
      staffFifoMistake: "Kesalahan Staf",
    },
    noReport: {
      title: "Belum ada laporan yang dibuat.",
      description: "Silakan unggah file yang diperlukan untuk memulai."
    },
    errors: {
      noRecords: "Tidak ada catatan yang cocok ditemukan berdasarkan kriteria laporan.",
      noRecordsInFile: "Tidak ada catatan yang cocok ditemukan di dalam file berdasarkan kriteria untuk jenis laporan ini.",
      unknownError: "Terjadi kesalahan yang tidak diketahui saat pembuatan laporan.",
      unknownErrorProcessingFile: "Terjadi kesalahan yang tidak diketahui saat memproses file.",
      processingFailed: "Pemrosesan gagal.",
      fileProcessFailed: "Satu atau lebih file gagal diproses. Silakan periksa status.",
      rsIncorrectFileCount: "Harap unggah tepat 7 file: 6 untuk pendapatan bulanan dan 1 untuk info staf.",
      rsIncorrectFileCountStatus: "Jumlah file yang diunggah salah.",
      rsFileIdentification: "Tidak dapat mengidentifikasi file. Pastikan nama file info staf berisi 'staf' dan ada 6 file bulanan.",
      isIncorrectFileCount: "Harap unggah tepat 2 file: 1 untuk kriteria dan 1 untuk data utama.",
      isIncorrectFileCountStatus: "Jumlah file yang diunggah salah.",
      isFileIdentification: "Tidak dapat mengidentifikasi file. Pastikan file kriteria memiliki 'criteria' dan file data utama memiliki 'data' dalam namanya.",
      missing: "Hilang",
      incorrectCount: "Jumlah salah",
    }
  },
  fileUpload: {
    clickToUpload: "Klik untuk mengunggah",
    dragAndDrop: "atau seret dan lepas.",
    fileTypes: "Hanya file XLSX atau XLS",
    processing: "Memproses...",
    disabled: "Harap unggah file AM terlebih dahulu.",
    statusTitle: "Status File yang Diperlukan:",
    fileNameLabel: "File",
    soNotExport: {
      title: "Unggah Data Utama",
    },
    fifo: {
      title: "Unggah File Laporan FIFO Toko",
      description: "Jatuhkan semua 9 file sekaligus. Aplikasi akan mengidentifikasinya berdasarkan nama."
    },
    staffFifo: {
        title: "Unggah File Kesalahan FIFO Staf",
        description: "Jatuhkan semua 6 file yang diperlukan. Aplikasi akan mengidentifikasi berdasarkan nama (Data penjualan harus mengandung 'penjualan')."
    },
    transferGoods: {
      title: "Unggah File Transfer Barang",
      description: "Jatuhkan file Data AM dan Transfer Barang. Aplikasi akan mengidentifikasinya."
    },
    depositTools: {
      title: "Unggah File Deposit Manual",
      description: "Jatuhkan file Data AM dan Deposit Manual. Aplikasi akan mengidentifikasinya."
    },
    revenueStaff: {
      title: "Unggah File Pendapatan Staf",
      description: "Jatuhkan file Info Staf dan 6 file data bulanan. File staf harus mengandung 'staff' di namanya."
    },
     incentiveStaff: {
      title: "Unggah File Insentif Staf",
      description: "Jatuhkan file kriteria (nama harus menyertakan 'criteria') dan file data penjualan utama (nama harus menyertakan 'data')."
    },
    incentiveStaffBolltech: {
      title: "Unggah File Insentif Bolltech",
      description: "Jatuhkan file kriteria Bolltech (nama harus menyertakan 'bolltech') dan file data penjualan utama."
    },
  },
  fileLabels: {
    am: "Data AM",
    phone: "Data Telepon",
    tablet: "Data Tablet",
    tv: "Data TV",
    speaker: "Data Speaker",
    detailPhone: "Detail FIFO Telepon",
    detailTablet: "Detail FIFO Tablet",
    detailTv: "Detail FIFO TV",
    detailSpeaker: "Detail FIFO Speaker",
    salesData: "Data Penjualan",
    transferGoods: "Data Transfer Barang",
    depositTools: "Data Deposit Manual",
    staffInfo: "Data Info Staf",
    month1: "Data Bulan 1",
    month2: "Data Bulan 2",
    month3: "Data Bulan 3",
    month4: "Data Bulan 4",
    month5: "Data Bulan 5",
    month6: "Data Bulan 6",
    criteria: "Kriteria Insentif",
    criteriaBolltech: "Kriteria Bolltech",
    mainData: "Data Penjualan Utama",
  },
  instructions: {
    title: "Cara Kerja",
    process: "Proses",
    filteringRule: "Aturan Penyaringan",
    filteringRules: "Aturan Penyaringan",
    newColumns: "Kolom Baru",
    updatedColumns: "Kolom Baru/Diperbarui",
    reportDetails: "Detail Laporan",
    footer: "Harap pastikan file Excel yang Anda unggah berisi kolom yang diperlukan agar laporan dapat dibuat dengan benar.",
    soNotExport: {
      p1: "Alat ini menyaring pesanan penjualan untuk menemukan item yang telah dibayar tetapi belum diekspor dari sistem.",
      rules: {
        title: "Aturan Penyaringan:",
        intro: "Laporan hanya akan menyertakan baris yang memenuhi kriteria berikut:",
        rule1: "\"Tanggal pengiriman\" telah lewat (lebih awal dari tanggal Anda mengunggah file). Baris dengan tanggal pengiriman hari ini atau di masa depan akan dikecualikan.",
        rule2: {
          text: "Kolom \"Jenis permintaan ekspor\" adalah salah satu dari berikut ini:",
          option1: "ERABLUE- Sales at Store",
          option2: "ERABLUE- Sales Delivery at home"
        }
      }
    },
    transferGoods: {
      p1: "Laporan ini mengidentifikasi transfer barang yang terlambat diterima oleh toko tujuan.",
      process: {
        step1: "Unggah file Excel yang berisi data Area Manager (AM). File ini harus memiliki kolom \"Kode Toko\", \"Nama AM\", dan \"City\".",
        step2: "Unggah file data utama Transfer Barang Anda."
      },
      rule: "Laporan hanya akan menampilkan transfer di mana \"Tanggal Transfer Toko\" lebih dari 7 hari yang lalu.",
      columns: {
        dateFromTransfer: "\"Selisih Hari Transfer\": Dihitung sebagai Tanggal Hari Ini dikurangi Tanggal Transfer Toko.",
        amStores: "\"AM Toko Output/Input\": Diisi dengan mencocokkan kode toko dari file utama Anda dengan file data AM.",
        cities: "\"Output/Input City\": Diisi dengan mencocokkan kode toko dengan file data AM."
      }
    },
    depositTools: {
      p1: "Laporan ini mengidentifikasi setoran penjualan manual yang terlambat dan menandai potensi duplikat dengan menggunakan data AM.",
      process: {
        step1: "Unggah file Excel yang berisi data Area Manager (AM). File ini harus memiliki kolom \"Kode Toko\" dan \"Nama AM\".",
        step2: "Unggah file data utama Deposit Manual Anda."
      },
      rules: {
        rule1: {
          text1: "Termasuk baris di mana \"Jenis voucher\" adalah ",
          code: "Erablue - Collecting sales deposits",
          text2: " DAN \"Tanggal invoucher\" lebih dari 3 hari yang lalu."
        },
        rule2: "Kemudian, daftar ini diperiksa terhadap seluruh file asli untuk menemukan transaksi unik. Transaksi dianggap unik jika kombinasi \"Nama pelanggan\" dan \"Jumlah pembayaran\" (mengabaikan tanda negatif) hanya muncul sekali di seluruh file. Langkah ini secara efektif menghapus setoran \"Collecting\" yang memiliki transaksi \"Refund\" yang sesuai.",
        rule3: "Terakhir, laporan hanya akan menyertakan entri di mana \"Selisih Hari\" yang dihitung kurang dari 60 hari."
      },
      columns: {
        checkDay: "\"Selisih Hari\": Dihitung sebagai Tanggal Hari Ini dikurangi Tanggal Invoucher.",
        am: "\"AM\": Diisi dengan mencocokkan kode toko dari file utama Anda dengan file data AM yang diunggah."
      }
    },
    fifo: {
      p1: "Laporan ini menganalisis kesalahan proses FIFO berdasarkan kategori (Telepon, Tablet, TV, Speaker) untuk toko yang telah melewati tanggal Grand Opening mereka.",
      process: {
        step1: "Unggah file data Area Manager (AM). Penting: File ini harus berisi kolom 'Kode Toko', 'Nama Toko', 'Nama AM', dan 'G.O'.",
        step2: "Unggah file data utama untuk Telepon.",
        step3: "Unggah file data utama untuk Tablet.",
        step4: "Unggah file data utama untuk TV.",
        step5: "Unggah file data utama untuk Speaker. Laporan akan dibuat secara otomatis setelah semua file disediakan."
      },
      rule: "Laporan akhir hanya akan menyertakan toko di mana tanggal Grand Opening sudah lewat."
    },
    staffFifoMistake: {
      p1: "Laporan ini mengidentifikasi anggota staf yang bertanggung jawab atas kesalahan FIFO dengan mencocokkan nomor IMEI antara data detail dan data penjualan.",
      process: {
        step1: "Unggah file data Area Manager (AM).",
        step2: "Unggah file Data Penjualan utama (harus berisi 'IMEI', 'Created user', 'Store').",
        step3: "Unggah semua empat file Detail FIFO (Telepon, Tablet, TV, Speaker). File-file ini harus berisi 'Sale Date' dan 'IMEI'.",
        step4: "Laporan dibuat secara otomatis setelah semua file disediakan."
      },
      rule: "Kesalahan dihitung jika sebuah baris di file Detail mana pun memiliki tanggal di kolom 'Sale Date'. Aplikasi kemudian menemukan 'Created user' dan 'Store' dari file Data Penjualan menggunakan IMEI yang cocok. Kesalahan hanya akan disertakan jika nama 'Store' dari data penjualan juga ada di dalam file Data AM yang diunggah."
    },
     revenueStaff: {
      p1: "Laporan ini menghasilkan ringkasan total pendapatan per anggota staf selama enam bulan, termasuk peringkat kinerja.",
      process: {
        step1: "Siapkan tujuh file Excel terpisah: 6 untuk pendapatan bulanan dan 1 untuk data master staf.",
        step2: "File Info Staf harus berisi kolom: 'NO', 'ID Staf', 'Nama Staf', dan 'Nama Toko'.",
        step3: "Setiap file pendapatan bulanan harus berisi kolom: 'Pengguna Input', 'Pendapatan Akhir termasuk Pengembalian', dan 'Tanggal Output'.",
        step4: "Unggah ketujuh file sekaligus. File info staf harus memiliki 'staff' dalam namanya untuk diidentifikasi."
      },
      details: {
        detail1: "Ini menjumlahkan pendapatan untuk setiap 'Pengguna Input' unik setiap bulan.",
        detail2: "10% teratas dari pemain setiap bulan menerima bintang (⭐).",
        detail3: "10% terbawah dari pemain setiap bulan menerima emoji sedih (😕)."
      }
    },
    incentiveStaff: {
      p1: "Laporan ini menghitung total insentif yang diperoleh setiap anggota staf berdasarkan penjualan produk dalam periode tertentu.",
      process: {
          step1: "Unggah file Kriteria Insentif. Harus berisi kolom: 'Kode produk', 'Tanggal mulai', 'Tanggal berakhir', dan 'Insentif / unit'. Nama file harus menyertakan kata 'criteria'.",
          step2: "Unggah file data penjualan mentah utama. Harus berisi 'Kode produk', 'Sub Kategori&Merek', 'Tanggal dibuat', dan 'Pengguna yang dibuat'. Nama file harus menyertakan kata 'data'."
      },
      details: {
          detail1: "Untuk setiap penjualan di data utama, aplikasi memeriksa apakah 'Tanggal dibuat' berada dalam 'Tanggal mulai' dan 'Tanggal berakhir' dari aturan mana pun di file kriteria.",
          detail2: "Ini juga memeriksa apakah 'Kode produk' atau 'Sub Kategori&Merek' penjualan cocok dengan 'Kode produk' dari aturan yang sama.",
          detail3: "Jika kedua kondisi terpenuhi, 'Insentif / unit' yang ditentukan diberikan kepada 'Pengguna yang dibuat' (staf). Laporan kemudian menunjukkan total insentif untuk setiap anggota staf."
      }
    },
    incentiveStaffBolltech: {
      p1: "Laporan ini menghitung total insentif Bolltech yang diperoleh setiap anggota staf.",
      process: {
          step1: "Unggah file Kriteria Insentif Bolltech. Harus berisi: 'Kode produk + SRP Bolttech', 'Tanggal mulai', 'Tanggal berakhir', dan 'Insentif / unit'. Nama file harus menyertakan 'bolltech'.",
          step2: "Unggah file data penjualan mentah utama. Harus berisi 'Kode produk', 'Sale Price (VAT)', 'Tanggal dibuat', dan 'Pengguna yang dibuat'."
      },
      details: {
          detail1: "Untuk setiap penjualan, aplikasi membuat kunci dengan menggabungkan 'Kode produk' + 'Sale Price (VAT)'.",
          detail2: "Aplikasi akan memeriksa apakah kunci ini cocok dengan kunci dari file kriteria ('Kode produk + SRP Bolttech') dan apakah tanggal penjualan berada dalam periode insentif.",
          detail3: "Jika cocok, insentif diberikan. Laporan menunjukkan total insentif per staf dan rincian berdasarkan setiap kunci produk Bolltech."
      }
    }
  },
  reports: {
    sourceFile: "File sumber",
    totalRecords: "Total catatan yang cocok: {{count}}",
    downloadExcel: "Unduh Excel",
    downloadAriaLabel: "Unduh laporan sebagai file Excel",
    soNotExport: {
      title: "Laporan SO Belum Ekspor",
      description: "Buat laporan pesanan penjualan yang sudah dibayar namun belum diekspor dari sistem."
    },
    transferGoods: {
      title: "Laporan Transfer Barang",
      description: "Buat laporan transfer barang yang terlambat diterima (> 7 hari)."
    },
    depositTools: {
      title: "Laporan Deposit Manual",
      description: "Menghasilkan laporan tentang setoran penjualan manual yang lebih lama dari 3 hari dengan potensi duplikat."
    },
    fifo: {
      title: "Laporan Kesalahan FIFO Toko",
      description: "Menghitung total kesalahan proses FIFO per toko, disaring berdasarkan tanggal Grand Opening.",
      excelTitle: "RESUME MTD FIFO ICT & AV | {{date}}"
    },
    staffFifoMistake: {
      title: "Laporan Kesalahan FIFO Staf",
      description: "Mengidentifikasi staf yang bertanggung jawab atas kesalahan FIFO dengan mencocokkan IMEI dari file detail dan penjualan.",
      categoryTitle: "Kesalahan Kategori {{category}}"
    },
    revenueStaff: {
        title: "Laporan Pendapatan Staf",
        description: "Menghasilkan laporan pendapatan per anggota staf selama enam bulan terakhir."
    },
    incentiveStaff: {
      title: "Laporan Insentif Staf",
      description: "Menghitung total insentif yang diperoleh setiap anggota staf berdasarkan kriteria penjualan."
    },
    incentiveStaffBolltech: {
      title: "Laporan Insentif Staf (Bolltech)",
      description: "Menghitung total insentif Bolltech yang diperoleh setiap anggota staf."
    },
    tableHeaders: {
      am: "AM",
      grandTotal: "Total Keseluruhan",
      soNotExport: {
        orderCode: "Kode Pesanan",
        customerName: "Nama Pelanggan",
        createdDate: "Tanggal Dibuat",
        deliveryDate: "Tanggal Pengiriman",
        outputStore: "Toko Output",
        totalAmount: "Jumlah Total"
      },
      transferGoods: {
        transportVoucher: "Voucher Transportasi",
        outputStore: "Toko Output",
        outputCity: "Output City",
        inputStore: "Toko Input",
        inputCity: "Input City",
        transferStoreDate: "Tgl Transfer Toko",
        inventoryStatus: "Status Inventaris",
        dateFromTransfer: "Selisih Hari Transfer",
        amOutputStore: "AM Toko Output",
        amInputStore: "AM Toko Input"
      },
      depositTools: {
        store: "Toko",
        inOutVoucher: "Voucher In/out",
        customerName: "Nama Pelanggan",
        date: "Tanggal Invoucher",
        checkDay: "Selisih Hari",
        paymentAmount: "Jumlah Pembayaran",
        content: "Konten"
      },
      fifo: {
        no: "NO",
        storeCode: "STORE ID",
        storeName: "Nama Toko",
        saleOut: "Sale Out",
        mistake: "Mistake",
        percent: "Percent"
      },
      staffFifoMistake: {
        no: "NO",
        staffName: "Nama Staf",
        storeName: "Nama Toko",
        imei: "IMEI",
        date: "Tanggal",
        qty: "QTY"
      },
      revenueStaff: {
        no: "NO",
        inputuser: "Pengguna Input",
        staffname: "Nama Staf",
        workingstore: "Toko Bekerja",
        star: "BINTANG",
        bottom: "BAWAH"
      },
      incentiveStaff: {
        staff: "Staf",
        total: "TOTAL",
      }
    }
  }
};

export default id;