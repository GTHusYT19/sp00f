const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const mc = require('minecraft-protocol');

let mainWindow;
let proxyServer;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (proxyServer) {
    proxyServer.close();
  }
  if (process.platform !== 'darwin') app.quit();
});

// Démarre le proxy avec les paramètres reçus du renderer
ipcMain.handle('start-proxy', (event, config) => {
  if (proxyServer) {
    proxyServer.close();
  }

  proxyServer = mc.createServer({
    'online-mode': false,
    port: parseInt(config.listenPort),
    version: false
  });

  proxyServer.on('login', (client) => {
    mainWindow.webContents.send('log', `[+] Connexion de ${client.socket.remoteAddress}`);

    const server = mc.createClient({
      host: config.backendHost,
      port: parseInt(config.backendPort),
      username: config.spoofedUsername,
      keepAlive: true,
      skipValidation: true,
      connect: client
    });

    server.on('connect', () => {
      mainWindow.webContents.send('log', '[>] Transfert vers backend réussi');
    });

    server.on('end', () => {
      mainWindow.webContents.send('log', '[x] Déconnecté du backend');
    });

    client.on('end', () => {
      mainWindow.webContents.send('log', '[x] Client déconnecté');
    });

    client.pipe(server).pipe(client);
  });

  proxyServer.on('listening', () => {
    mainWindow.webContents.send('log', `🚀 Proxy actif sur localhost:${config.listenPort}`);
  });

  proxyServer.on('error', (err) => {
    mainWindow.webContents.send('log', `❌ Erreur proxy: ${err.message}`);
  });

  return 'Proxy démarré';
});
