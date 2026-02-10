const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { initDatabase, runQuery, runExecute } = require('./database.cjs');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // In development, load from localhost
  // In production, load from the dist directory
  const isDev = !app.isPackaged;

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'), { search: 'view=limited' });
  }
}

function setupIpcHandlers() {
  // GET Data Handler
  ipcMain.handle('db:get-deposit-data', async () => {
    try {
      const rows = await runQuery('SELECT * FROM deposit_transactions ORDER BY date DESC, id DESC');
      return { success: true, data: rows };
    } catch (error) {
      console.error('Error fetching deposit data:', error);
      return { success: false, error: error.message };
    }
  });

  // IMPORT Data Handler
  ipcMain.handle('db:import-deposit', async (event, dataRows) => {
    try {
      console.log(`Processing import for ${dataRows.length} rows...`);
      let successCount = 0;
      let errorCount = 0;

      // Cara Brutal tapi Efektif: Loop insert satu per satu (transaction akan lebih baik nanti)
      // Cek Duplikat berdasarkan voucher_no agar history aman
      for (const row of dataRows) {
        // Cek apakah voucher ini sudah ada? (Simple check)
        const exists = await runQuery('SELECT id FROM deposit_transactions WHERE voucher_no = ? LIMIT 1', [row.inOutVoucher]);

        if (exists.length === 0) {
          await runExecute(
            `INSERT INTO deposit_transactions (store_code, voucher_no, customer_name, date, amount, type, reference, content)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              row.store || '',
              row.inOutVoucher || '',
              row.customerName || '',
              row.date || '',
              row.paymentAmount || 0,
              row.type || (row.inOutVoucher?.startsWith('IN') ? 'DEPOSIT' : 'REFUND'),
              row.voucherReference || '',
              row.content || ''
            ]
          );
          successCount++;
        } else {
          // UPDATE Existing Data (Fixes corrupt data from previous attempts)
          await runExecute(
            `UPDATE deposit_transactions 
             SET store_code = ?, customer_name = ?, date = ?, amount = ?, type = ?, reference = ?, content = ?
             WHERE id = ?`,
            [
              row.store || '',
              row.customerName || '',
              row.date || '',
              row.paymentAmount || 0,
              row.type || (row.inOutVoucher?.startsWith('IN') ? 'DEPOSIT' : 'REFUND'),
              row.voucherReference || '',
              row.content || '',
              exists[0].id
            ]
          );
          successCount++;
          // errorCount++; // Dulu error/skip, sekarang update.
        }
      }

      console.log(`Import finished: ${successCount} inserted, ${errorCount} skipped (duplicate).`);
      return { success: true, count: successCount, skipped: errorCount };

    } catch (error) {
      console.error('Error importing deposit data:', error);
      return { success: false, error: error.message };
    }
  });
}

app.whenReady().then(() => {
  // Initialize Database
  initDatabase();

  // Setup IPC
  setupIpcHandlers();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
