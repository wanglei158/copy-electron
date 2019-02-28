import { app, BrowserWindow } from 'electron';

let mainWindow;
const winURL = process.env.NODE_ENV === 'development' ? 'http://localhost:9080' : `file://${__dirname}/index.html`;

function createWindow() {
    mainWindow = new BrowserWindow({
        height:666,
        width:500
    });

    mainWindow.loadURL(winURL);
}

app.on('ready', createWindow);