const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const url = require('url');
const sudo = require('sudo-prompt');
const { exec } = require('child_process');
const fs = require('fs').promises;
const sqlite3 = require('sqlite3').verbose();



let mainWindow;

/*Créer la fenêtre*/

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1366,
        height: 768,
        autoHideMenuBar: true,
        fullscreen: true,
        icon: path.join(process.cwd(), 'icone.png'),
        webPreferences: {
            nodeIntegration: false,  
            contextIsolation: true,  
            preload: path.join(__dirname, 'preload.js')  
        }
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'src/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});

/*Fonction pour ouvrir le tiroir caisse*/

ipcMain.on('launch-cash-drawer', () => {

    /* Pour ouvrir le tiroir, il faut executer en admin le CashDrawer.exe,
     qui est en apparence un prog qui envoie juste une tension sur le port DIO
     Il faut avoir Winlo32.dll et Winlo32.sys et CashDrawer.exe dans le dossier de l'executable*/

    const executablePath = path.join(process.cwd(), 'CashDrawer.exe');
    const options = {
        name: 'Electron App',
    };

    exec(executablePath, options, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erreur lors du lancement de l'exécutable : ${error}`);
        }
    });


});

/*Fonction pour ajouter une vente dans la db*/

ipcMain.on('save-products-to-database', (event, products) => {
    const dbPath = path.join(process.cwd(), 'sales.db');
    const db = new sqlite3.Database(dbPath);

    db.serialize(() => {
        db.run('CREATE TABLE IF NOT EXISTS sales (id INTEGER PRIMARY KEY AUTOINCREMENT, productName TEXT, quantity INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, type TEXT DEFAULT "Achat")');

        const stmt = db.prepare('INSERT INTO sales (productName, quantity) VALUES (?, ?)');
        products.forEach(({ name, quantity, type }) => {
            const adjustedQuantity = -quantity;
            stmt.run(name, adjustedQuantity);
        });
        stmt.finalize();
    });

    db.close();
});

/*Fonction pour exporter la db en csv*/

ipcMain.on('export-to-csv', () => {
    exportToCSV();
});


function exportToCSV() {
    const dbPath = path.join(process.cwd(), 'sales.db');
    const exportsFolderPath = path.join('Y:', 'exports');

    if (!fs.existsSync(exportsFolderPath)) {
        fs.mkdirSync(exportsFolderPath);
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toISOString().split('T')[1].split('.')[0];

    const sanitizedTimeStr = timeStr.replace(/:/g, '_');

    const fileName = `exported_sales_${dateStr}_${sanitizedTimeStr}.csv`;
    const outputPath = path.join(exportsFolderPath, fileName);

    const db = new sqlite3.Database(dbPath);

    console.log("CSV");

    db.serialize(() => {
        db.all('SELECT * FROM sales', (err, rows) => {
            if (err) {
                console.error(`Error querying the database: ${err}`);
                return;
            }

            const csvData = rows.map(row => `${row.id},${row.productName},${row.quantity},${row.timestamp},${row.type}`).join('\n');

            fs.writeFile(outputPath, csvData, (writeErr) => {
                if (writeErr) {
                    console.error(`Error writing to CSV file: ${writeErr}`);
                    return;
                }

                console.log(`CSV file exported successfully: ${outputPath}`);
            });
        });
    });

    db.close();
}


/*Fonction pour réinitialiser la db*/

ipcMain.on('reset-database', (event) => {
    resetDatabase();
});

function resetDatabase() {
    const dbPath = path.join(process.cwd(), 'sales.db');
    const db = new sqlite3.Database(dbPath);

    db.serialize(() => {
        db.run('DROP TABLE IF EXISTS sales');

        db.run('CREATE TABLE IF NOT EXISTS sales (id INTEGER PRIMARY KEY AUTOINCREMENT, productName TEXT, quantity INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, type TEXT DEFAULT "Achat")');

        console.log('Database reset successful');
    });

    db.close();
}

/*Fonction pour recupérer les dernières actions*/

ipcMain.handle('fetch-latest-orders', async () => {
    return await getLatestOrdersFromDatabase();
});

function getLatestOrdersFromDatabase() {
    return new Promise((resolve, reject) => {
        const dbPath = path.join(process.cwd(), 'sales.db');
        const db = new sqlite3.Database(dbPath);

        db.serialize(() => {
            db.all('SELECT * FROM sales ORDER BY timestamp DESC LIMIT 50', (err, rows) => {
                if (err) {
                    console.error(`Error querying the database: ${err}`);
                    reject(err);
                    return;
                }

                resolve(rows);
            });
        });

        db.close();
    });
}

/*Fonction pour read la liste des produits*/

ipcMain.handle('read-csv-file', async (event, filename) => {
    try {
        const filePath = path.join(process.cwd(), filename);
        const data = await fs.readFile(filePath, 'utf-8');
        return data;
    } catch (error) {
        console.error('Erreur lors de la lecture du fichier CSV:', error);
        throw error;
    }
});

/*Fonction pour supprimer une action de la databse*/

ipcMain.handle('delete-order', async (event, orderId) => {
    const dbPath = path.join(process.cwd(), 'sales.db');
    const db = new sqlite3.Database(dbPath);
  
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM sales WHERE id = ?', [orderId], err => {
        if (err) {
          reject(err);
          return;
        }
  
        resolve();
      });
    });
  });

  /*Fonction pour ajouter un stock dans la db*/

  ipcMain.on('save-stock-to-database', (event, productName, quantity) => {
    const dbPath = path.join(process.cwd(), 'sales.db');
    const db = new sqlite3.Database(dbPath);

    db.serialize(() => {
        db.run('CREATE TABLE IF NOT EXISTS sales (id INTEGER PRIMARY KEY AUTOINCREMENT, productName TEXT, quantity INTEGER, type TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)');

        const stmt = db.prepare('INSERT INTO sales (productName, quantity, type) VALUES (?, ?, ?)');
        stmt.run(productName, quantity, 'Restock');
        stmt.finalize();

    });

    db.close();
});

/*Fonction pour corriger le stock dans la db*/

ipcMain.on('correct-stock-in-database', (event, productName, correctedQuantity) => {
    const dbPath = path.join(process.cwd(), 'sales.db');
    const db = new sqlite3.Database(dbPath);

    const getCurrentQuantityQuery = 'SELECT SUM(quantity) as totalQuantity FROM sales WHERE productName = ?';
    db.get(getCurrentQuantityQuery, [productName], (err, row) => {
        if (err) {
            console.error(err.message);
            return;
        }

        const currentQuantity = row.totalQuantity || 0;

        const quantityDifference = correctedQuantity - currentQuantity;

        const insertCorrectionQuery = 'INSERT INTO sales (productName, quantity, type) VALUES (?, ?, ?)';
        db.run(insertCorrectionQuery, [productName, quantityDifference, 'Correction'], (err) => {
            if (err) {
                console.error(err.message);
                return;
            }

            db.close();
        });
    });
});


/*Fonction pour avoir la quantité totale de chaque produit dans la db*/


ipcMain.handle('get-quantities-sum-by-product', async () => {
    return await getQuantitiesSumByProduct();
});

function getQuantitiesSumByProduct() {
    const dbPath = path.join(process.cwd(), 'sales.db');
    const db = new sqlite3.Database(dbPath);

    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all('SELECT productName, SUM(quantity) AS totalQuantity FROM sales GROUP BY productName', (err, rows) => {
                if (err) {
                    console.error(`Error querying the database: ${err}`);
                    reject(err);
                    return;
                }

                const quantitiesSum = {};
                rows.forEach(row => {
                    quantitiesSum[row.productName] = row.totalQuantity;
                });

                resolve(quantitiesSum);
            });
        });

        db.close();
    });
}

/*Fonction pour éteindre l'ordi*/

ipcMain.on('shutdown-windows', (event) => {
    const options = {
        type: 'question',
        buttons: ['Oui', 'Annuler'],
        defaultId: 0,
        title: 'Confirmation',
        message: 'Êtes-vous sûr de vouloir éteindre la caisse ?',
    };

    dialog.showMessageBox(null, options).then((response) => {
        if (response.response === 0) {
            exec('shutdown /s /t 1', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Erreur lors de l'extinction de Windows: ${error.message}`);
                    return;
                }
                console.log(`Windows en cours d'extinction: ${stdout}`);
            });
        } else {
            event.sender.send('shutdown-cancelled');
        }
    });
});