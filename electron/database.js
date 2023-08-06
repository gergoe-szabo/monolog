const sqlite3 = require('sqlite3').verbose();

// Connect to the database or create one if it doesn't exist.
let db = new sqlite3.Database('./transcripts.db');

// Create the transcripts table if it doesn't exist.
const createTable = () => {
    const query = `
    CREATE TABLE IF NOT EXISTS transcripts (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        original_audio TEXT NOT NULL,
        transcript TEXT,
        key_terms TEXT,
        key_phrases TEXT
    );`;

    db.run(query);
};

// Initialize the database
createTable();

module.exports = db;
