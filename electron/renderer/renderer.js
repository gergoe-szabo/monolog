const { ipcRenderer } = require('electron');
const { spawn } = require('child_process');

document.getElementById('processBtn').addEventListener('click', () => {
    const fileInput = document.getElementById('audioFile');
    
    if (fileInput.files.length > 0) {
        const filePath = fileInput.files[0].path;
        ipcRenderer.send('start-python-backend', filePath);
    } else {
        alert("Please select an audio file first.");
    }
});

ipcRenderer.on('start-python-backend', (event, audioFilePath) => { //spawn Ionic
    const pythonProcess = spawn('python', ["./electron/backend/core.py", "--transcript", audioFilePath, "--key-information", "10"]);

    pythonProcess.stdout.on('data', (data) => {
        try {
            const results = JSON.parse(data.toString());
            ipcRenderer.send('audio-processed', results);
        } catch (error) {
            ipcRenderer.send('audio-process-error', 'Failed to parse Python output');
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
        ipcRenderer.send('audio-process-error', `Python Error: ${data}`);
    });
});

ipcRenderer.on('python-results', (event, message) => {
  console.log('Received results from Python:', message);
  
  window.postMessage({
      type: 'PYTHON_RESULTS',
      payload: message
  }, '*');
});

ipcRenderer.on('python-error', (event, error) => {
    console.error('Received error from Python:', error);
    
    window.postMessage({
        type: 'PYTHON_ERROR',
        payload: error
    }, '*');
});

ipcRenderer.on('main-message', (event, message) => {
    console.log('Received message from main process:', message);
});
