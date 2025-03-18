// On preload le ipcRenderer pour pouvoir l'utiliser dans le renderer

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: ipcRenderer,
  fetchLatestOrders: async () => {
    return await ipcRenderer.invoke('fetch-latest-orders');
  },
  getQuantitiesSumByProduct: async () => {
    return await ipcRenderer.invoke('get-quantities-sum-by-product');
  },
  readCSVFile: (filename) => ipcRenderer.invoke('read-csv-file', filename)
});

