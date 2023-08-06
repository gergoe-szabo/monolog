const fs = require('fs');
const { dialog } = require('electron');

const exportTranscript = (transcriptText) => {
    dialog.showSaveDialog({
        title: 'Save Transcript',
        filters: [{ name: 'Text Files', extensions: ['txt'] }],
    }).then(result => {
        if (!result.canceled) {
            fs.writeFileSync(result.filePath, transcriptText);
        }
    });
};

module.exports = exportTranscript;
