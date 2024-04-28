import {app, BrowserWindow} from 'electron';
import path from 'path';
import {connection} from './config/BancoDeDados';
import {serviceCliente} from './service/ServiceCliente';
import {serviceCaixa} from "./service/ServiceCaixa";

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    icon: path.join(__dirname, 'assets', 'images', 'icon.ico'),
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
    title: 'Que chique Gerenciador de estoque',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  connection.sync().then(r => console.log('Banco de dados sincronizado'));
  createWindow();
});

app.whenReady().then(() => {
  return Promise.all([serviceCaixa(), serviceCliente()]);
}).then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

