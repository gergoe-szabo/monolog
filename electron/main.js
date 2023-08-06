const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile(path.join(__dirname, '../www/index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error("Failed to load window content", errorCode, errorDescription);
    });

    // Uncomment to open the DevTools by default
    // mainWindow.webContents.openDevTools();
}

function startPythonBackend(audioFilePath) {
    const pythonExe = path.join(__dirname, 'backend', 'dist', 'core', 'core.exe');
    const args = ['--transcript', audioFilePath];

    console.log(`Attempting to run: ${pythonExe} ${args.join(' ')}`);

    const pythonProcess = spawn(pythonExe, args); // Notice I've removed scriptPath here.

    pythonProcess.on('error', (error) => {
        console.error("Failed to start python process:", error);
        mainWindow.webContents.send('audio-process-error', `Failed to start Python process: ${error.message}`);
    });

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python stdout: ${data}`);
        const parsedData = JSON.parse(data.toString()); 
        mainWindow.webContents.executeJavaScript(`window.postMessage({type: 'PYTHON_RESULTS', payload: ${data}}, '*');`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
        if (data.includes('NumbaDeprecationWarning') || data.includes('FP16 is not supported')) {
            return; // ignore/suppress these specific warnings
        }
        mainWindow.webContents.send('message', { type: 'PYTHON_ERROR', payload: data.toString() });
    });

    pythonProcess.on('exit', (code, signal) => {
        if (code !== 0) {
            console.error(`Python process exited with code ${code} and signal ${signal}`);
            mainWindow.webContents.send('audio-process-error', `Python process exited unexpectedly with code ${code}`);
        }
    });
}

app.on('ready', createWindow);

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on('process-audio', (event, audioFilePath) => {
    startPythonBackend(audioFilePath);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
