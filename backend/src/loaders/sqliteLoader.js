const sqlite3 = require('sqlite3').verbose();

// Singleton database access object
// src: https://gist.github.com/danysantiago/7077003
const db = (function() {
    let db;


    function initializeDB() {
        db = createDB();


        // return {
        //     getDB: () => _db,
        //     setDB: () => _db = createDB()
        // };
    }

    return {
        getDBInstance: () => {
            if(!db) {
                initializeDB()
            }
            return db;
        }
    }
})();

const configs = [
    /** filename **/ '../res/game-stats.db',
    /**     mode **/ [sqlite3.OPEN_CREATE, sqlite3.OPEN_READWRITE],
    /** callback **/ err => {if (err) throw err}
]

const createDB = () => new sqlite3.Database(...configs).on('open', () => console.log('DB connection established')); 
const closeDB = (db) => db.close(err => {if(err) throw err}).on('close', () => console.log('DB connection is closed'));

module.exports = {
    sqliteDB: db.getDBInstance(),
    closeDB: closeDB
}