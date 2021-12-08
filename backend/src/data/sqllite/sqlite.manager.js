const sqlite3 = require('sqlite3').verbose();

/**
 * Provides methods to get database instance and create/close database
 * 
 * @constructor
 * @param {string} filepath - File path to where SQLite database file should reside; Default: anonymous in-memory database that is not persisted
 */
function SqliteManager(configs) {
    if(!configs){
        configs = {
            filepath: ':memory:',
            mode: [sqlite3.OPEN_CREATE, sqlite3.OPEN_READWRITE],
            callback: function(err) { 
                if (err) throw err;
                console.log('Database connecting...');
            }
        }
    }

    this.filepath = configs.filepath;
    this.mode = configs.mode;
    this.connectionCallback = configs.callback;

    // Singleton database access object
    // src: https://gist.github.com/danysantiago/7077003
    this.dbManager = (function() {
    
        let instance;
    
        function setupSingleton(){
            let _db;
    
            return{
                getDB: () => _db,
                setDB: (db) => _db = db
            }
        }
    
        return {
            getDbManager: () => {
                // setup access to database singleton _db
                if(!instance) {
                    instance = setupSingleton();
                }
                return instance;
            }
        }
    })().getDbManager();
}

/**
 * Connects to SQLite and provides Sqlite object
 * 
 * @returns {Object} Database object representing SQLite with name Database
 */
SqliteManager.prototype.createDatabase = function() {
    return new Promise( (resolve, reject) => {
        // if database not created:
        if(!this.dbManager.getDB()){
            try {
                const db = new sqlite3.Database(this.filepath, this.mode, this.connectionCallback)
                    .on('open', () => {
                        this.dbManager.setDB(db);
                        console.log('Database connection established!')
                        resolve(this.dbManager.getDB());
                    })
            } catch(err) {reject(err)}
        } else resolve(this.dbManager.getDB());
    })
}

/**
 * Closes connection to SQLite database
 * 
 * @returns {boolean} True for successful database closure; False for no datbase found to close
 */
SqliteManager.prototype.closeDatabase = function(){
    return new Promise((resolve, reject) => {
        // if database not created:
        if(!this.dbManager.getDB()){
            console.log('No database connection to close!')
            resolve(false);
        } else {
            this.dbManager.getDB()
                .close(err => {if(err) reject(err)})
                .on('close', () => {
                    console.log('Database connection is closed!');
                    this.dbManager.setDB(undefined)
                    resolve(true);
                });
        }        
    })
}

module.exports = SqliteManager;


// Represents the Non-promises, synchronous version of the code

// SqliteManager.prototype.createDatabase = function() {

//     // if database not created:
//     if(!this.dbManager.getDB()){
//         const db = new sqlite3.Database(this.filepath, this.mode, this.connectionCallback)
//             .on('open', () => {
//                 this.dbManager.setDB(db)
//                 console.log('Database connection established!')
//                 return this.dbManager.getDB()
//             });
//     } else return this.dbManager.getDB();
// }

// SqliteManager.prototype.closeSqliteDb = function(){

//     // if database not created:
//     if(!this.dbManager.getDB()){
//         console.log('No database connection to close!')
//         return false;
//     } else {
//         this.dbManager.getDB()
//             .close(err => {if(err) throw err})
//             .on('close', () => {
//                 console.log('Database connection is closed');
//                 return true;
//             });
//     }
// }