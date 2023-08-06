const db = require('./database');
const { v4: uuidv4 } = require('uuid');

// Function to save a new transcript.
const saveTranscript = (data) => {
    const id = uuidv4();
    const date = new Date().toISOString();

    const insertQuery = `INSERT INTO transcripts (id, date, original_audio, transcript, key_terms, key_phrases) VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(insertQuery, [id, date, data.original_audio, data.transcript, JSON.stringify(data.key_terms), JSON.stringify(data.key_phrases)], (err) => {
        if (err) throw err;
    });
};

// Function to get all transcripts.
const getAllTranscripts = (callback) => {
    db.all("SELECT * FROM transcripts", [], (err, rows) => {
        if (err) throw err;
        callback(rows);
    });
};

module.exports = {
    saveTranscript,
    getAllTranscripts
};
