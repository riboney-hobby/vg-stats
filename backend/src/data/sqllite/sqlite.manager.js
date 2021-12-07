const sqlite3 = require('sqlite3').verbose();

/**
 * Provides methods to get database instance and create/close database
 * 
 * @constructor
 * @param {string} filepath - File path to where SQLite database file should reside; Default: anonymous in-memory database that is not persisted
 */
function SqliteManager(configs) {
    if(!configs){
        configs = [
            /** filename **/ ':memory:',
            /**     mode **/ [sqlite3.OPEN_CREATE, sqlite3.OPEN_READWRITE],
            /** callback **/ err => {if (err) throw err}
        ]
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

SqliteManager.prototype.createDatabase = function() {

    // if database not created:
    if(!this.dbManager.getDB()){
        const db = new sqlite3.Database(...configs)
            .on('open', () => console.log('DB connection established'));
        this.dbManager.setDB(db)
    }

    return this.dbManager.getDB()
}

SqliteManager.prototype.closeSqliteDb = function(){

    // if database not created:
    if(!this.dbManager.getDB()){
        return false;
    }

    this.dbManager.getDB()
        .close(err => {if(err) throw err})
        .on('close', () => console.log('DB connection is closed'));
    
    return true;
}


module.exports = SqliteManager;
