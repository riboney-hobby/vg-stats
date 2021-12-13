const {generateCharacters } = require('../../utils/misc-utils');
const {getTableFromCreate, getTableFromInsert, getTableFromDrop} = require('../../utils/db-utils');

/**
 * CRUD Interface for Sqlite
 * 
 * @constructor
 * @param {sqlite3.Database} db - SQLite database instance
 */
function SqliteDAO(db) {
    if(!db) throw new Error('Database not connected!');
    this.db = db;
}

/**
 * Runs DQL statements that are expected to have small result set; Use XXX for queries that will return large result sets
 * 
 * @param {string} query - Non parameterized SQL query
 * @returns {Promise} Contains array representing the rows of the result set from the query
 */
 SqliteDAO.prototype.query = function(query) {

    return new Promise((resolve, reject) => {
        this._checkDBConnection(reject);

        this.db.all(query, params=[], function(err, rows){
            if(err) reject(err);
            else resolve(rows);
        })
    })
}

/**
 * Runs most DDL/DML statements 
 * 
 * @param {string} query - SQL query that changes some aspect of the table
 * @returns {Promise} Contains the ID of last updated row and number of changes made
 */
 SqliteDAO.prototype.run = function (query) {

    return new Promise((resolve, reject) => {
        this._checkDBConnection(reject);

        this.db.run(query, params=[], function(err){
            if(err) reject(err);
            else resolve({id: this.lastID, changes: this.changes});
        })
    })
}

/**
 * Performs one SQL `INSERT` based on the provided arguments
 * 
 * @param {string} tableName - name of the table to insert values 
 * @param {string[]} columns - array of the names of the columns to insert values into 
 * @param {string[]} values  - values to pass into INSERT
 * @returns {Promise} Returns ID of last record inserted and the number of changes made
 */
 SqliteDAO.prototype.insert = function(tableName, columns, values){

    if(!tableName | !columns | !values) throw new Error('Insert function is missing arguments!')
    const params = [...values];
    const sql = this._generateInsert(tableName, columns.join(', '), values.length);
    

    return new Promise((resolve, reject) => {

        this._checkDBConnection(reject);

        this.db.run(sql, params, function(err){
            if(err) reject(err)
            else resolve({id: this.lastID, changes: this.changes})
        })
    })
}

SqliteDAO.prototype._checkForMissingArgs(errMessage, ...valuesToCheck){
    
}

/**
 * Utility function to produce SQL INSERT statement
 * 
 * @param {string} tableName - name of the table to insert values 
 * @param {string[]} columns - string separated by commas containing the columns to INSERT values into 
 * @param {string[]} parameterAmt  - number of '?'s placeholders to place into INSERT statement
 * @returns {string} Returns SQL INSERT statement for sqlite3.Database
 */
SqliteDAO.prototype._generateInsert = function(table, columns, parameterAmt){
    
    const placeholders = generateCharacters('?', ',', parameterAmt);

    return `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
}

/**
 * Retrieves record matching the provided table name and WHERE condition
 * 
 * @param {string} tableName - name of table to query 
 * @param {string} where - the condition for the WHERE clause
 * 
 * @returns {Promise} Promise that contains an object containing the values for the first row found
 */
 SqliteDAO.prototype.retrieve = function(tableName, where){
    
    const params = [where];

    return new Promise((resolve, reject) => {
        this._checkDBConnection(reject);

        this.dbInstance.get(`SELECT * FROM ${tableName} WHERE ?`, params, function(err, row){
            if(err) reject(err)
            else resolve(row)
        })
    })
}

/**
 * Retrieves record matching the provided table name and ID 
 * 
 * @param {string} tableName - name of table to query 
 * @param {string} id - ID value of the record being sought
 * 
 * @returns {Promise} Promise that contains an object containing the values for the first row found
 */
 SqliteDAO.prototype.retrieveByID = function(tableName, id){
    const params = [id];

    return new Promise((resolve, reject) => {
        this._checkDBConnection(reject);

        this.dbInstance.get(`SELECT * FROM ${tableName} WHERE id = ?`, params, function(err, row){
            if(err) reject(err)
            else resolve(row)
        })
    })
}

/**
 * Retrieves all rows from tableName
 * 
 * @param {string} tableName - name of the table to query
 * @returns {Promise} Promise that contains array of all rows in table
 */
 SqliteDAO.prototype.retrieveAll = function(tableName) {
    if(!tableName) reject(new Error('Cannot show table, table name not provided!'));

    return new Promise((resolve, reject) => {
        this._checkDBConnection(reject);

        this.db.all(`SELECT * FROM ${tableName}`, params=[], function(err, rows){
            if(err) reject(err)
            else resolve(rows)
        })
    })
}


/**
 * Deletes record from tableName by the provided ID
 * 
 * @param {string} tableName  - Table to delete row from
 * @param {string} ID - ID of the row to be deleted
 * @returns {Promise} Promise contains the the ID of the last deleted row and number of changes to the table
 */
 SqliteDAO.prototype.deleteByID = function(tableName, ID) {
    const params = [ID];

    return new Promise((resolve, reject) => {
        this._checkDBConnection(reject);

        this.dbInstance.run(`DELETE FROM ${tableName} WHERE ID = ?`, params, function(err){
            if(err) reject(err)
            else resolve({id: this.lastID, changes: this.changes})
        })
    })
}

/**
 * Destroys and recreates tables
 * @param {Object} configs - arguments for SQL statemetns
 * @param {string[]} configs.tablesToDrop - Names of all database tables to drop
 * @param {string[]} configs.tablesToCreate - List of `CREATE TABLE` sql statements
 * @returns {string} - Completion message
 */
 SqliteDAO.prototype.initTables = function({tablesToDrop, tablesToCreate}){
    
    return new Promise((resolve, reject) => {
        this._checkDBConnection(reject);
        if(!tablesToDrop || !tablesToCreate) reject(new Error('Database configs not provided!'));

        let completionMsg = 'Tables initialized...';
        if(tablesToDrop.length != tablesToCreate.length) 
            msg.concat('', '\nWarning! Not all tables may have not been reinitialized!');

        this.db.serialize(() => { 
            try{
                this._destroyTables(tableNames);
                this._createTables(createStmts);
            } catch(err){
                console.log('Error in database initialization!')
                reject(err);
            }
        });
        
        resolve(completionMsg);
    })
}

/**
 * Performs `DROP TABLES` SQL operation on the provided list of table names; must be wrapped in new sqlite3.Database().serialize() method!
 * @param {string[]} tableNames - Names of all database tables to drop
 */
SqliteUtils.prototype._destroyManyTables = function(tableNames){
    
    if(!tableNames) throw new Error('Missing table names!');
    tableNames.forEach(name => this.db.run(`DROP TABLE IF EXISTS ${name}`, [], function(err){
        if(err) {
            console.log('Error encountered in _destroyManyTables!');
            throw err;
        } 
        else {
            console.log(`Table ${name} dropped!`)
        }
    }));
}

/**
 * Runs the provided 'CREATE TABLE' statements; must be wrapped in new sqlite3.Database().serialize() method!
 * @param {string[]} createStmts - List of `CREATE TABLE` sql statements
 * @returns {string} Returns message to indicate success
 */
SqliteUtils.prototype._createManyTables = function(createStmts){
    
    if(!createStmts) throw new Error('CREATE TABLE statements missing!');

    createStmts.forEach(create_table => this.db.run(create_table, [], function(err){
        if(err) {
            console.log('Error encountered in _destroyManyTables!');
            throw err;
        } 
        else {
            const name = getTableFromCreate(create_table);
            console.log(`Table '${name}' created!`)
        }
    }));
}

/**
 * Runs one `CREATE TABLE` statement
 * @param {string} createTableStatement - SQL Create table statement
 * @returns {string} Returns message to indicate success
 */
 SqliteDAO.prototype.createTable = function(createTableStatement){

    if(!createTableStatement) throw new Error("Missing 'CREATE TABLE' statement");

    const tableName = getTableFromCreate(createTableStatement);

    return new Promise((resolve, reject) => {
        this._checkDBConnection(reject);
        this.db.run(createTableStatement, [], function(err){
            if(err) reject(err)
            resolve(`Table '${tableName}' created!`)
        })
    })
}

/**
 * Queries database for `CREATE TABLE` information of all tables
 * 
 */
SqliteUtils.prototype.showCreateTableInfo = function(){

    const stmt = "SELECT * FROM sqlite_master WHERE type='table'";

    return new Promise((resolve, reject) => {

        this._checkDBConnection(reject);
        this.db.all(stmt, [], (err, rows) => {
            if(err) reject(err);
            else console.log('Table information:\n', rows);
        });

        resolve();
    })
}

/**
 * Displays rowCount number of rows from the list of table names provided
 * 
 * @param {string[]} tableNames - the list of tables to query
 * @param {number} rowCount - The number of rows to display
 * @returns 
 */
SqliteUtils.prototype.showAllTables = function(tableNames, rowCount = 5){
    return new Promise((resolve, reject) => {
        this._checkDBConnection(reject);
        if(!tableNames) reject(new Error('Cannot show table, table name not provided!'));
    
        this.db.serialize(function(){
            for(let i = 0; i<tableNames.length; i++){
                let results = [];
                this.db.each(`SELECT * FROM ${tableNames[i]} LIMIT ${rowCount}`, [], 
                    /*per row*/ (err, row) => {
                    if(err) reject(err);
                    else {
                        results.push(row);
                    }
                }, 
                    /*after all rows*/(err, numOfRows) => {
                    if(err) reject(err);
                    else {
                        console.log(`${tableNames[i]} tables:\n`, results);
                        results = [];
                        resolve();
                    }
                });
            }
        })
    })
}


/**
 * Executes multiple INSERT statements; Meant for database seeding
 * 
 * @param {string} queries - Single string composed of multiple INSERT statements to execute all at once
 * @returns 
 */
SqliteUtils.prototype.insertMany = function(queries){
    return new Promise( (resolve, reject) => {
        const afterTabs = 5;
        const endOfWord = 11;
        const startsWithInsert = queries.substring(afterTabs, endOfWord).toUpperCase().startsWith('INSERT');
        
        this._checkDBConnection(reject);
        if(!queries || !startsWithInsert) reject(new Error('Insert queries not provided!'));

    
        this.db.serialize(function(){
            try{
                this.db.exec(queries, (err) => {
                    if(err) { 
                        console.log('The error: ', queries, '\n', err);
                        throw err;
                    } else {
                        console.log('Process pending...')
                        resolve();
                    }
                });
            } catch(err){
                reject(err);
            }
        })
    })
}

/**
 * 
 * @param {Function} reject - the reject callback provided by Promises
 */
 SqliteDAO.prototype._checkDBConnection = function(reject){
    if(!this.db) reject(new Error('Database is connected! Aborting operation...'));
}



module.exports = SqliteDAO;

/**
 * @typedef sqlite3.Database - Represents SQLite3 database instance
 * @type {object}
 * @property {string} - filepath to the sqlite3 database file to open/create; use `:memory:` for in-memory database
 * @property {number} - OPEN_READONLY, OPEN_READWRITE, OPEN_CREATE (default: OPEN_READWRITE | OPEN_CREATE)
 * @property {callback=} - optional callback to run while opening database and to catch errors
 * 
*/

/**********
* EX USE CASE: 
**********/

// const statement = `
//     CREATE TABLE IF NOT EXISTS foo (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         rank INTEGER NOT NULL UNIQUE,
//         name TEXT NOT NULL)`;
//
// const stmt3 = `PRAGMA table_info(foo)`
// const input = {
//     tableName: 'foo',
//     columns: ['rank', 'name'],
//     values: ['1', 'Bob']
// }
//
// async function run(){
//     try{
//         const dbConnection = new SqliteManager();
//         const d = await dbConnection.createDatabase();
//         const db = new SqliteDAO(d);
//         const sm = await db.createTable(statement); // createTable() moved to db_utils.js
//         let rs = await db.insert(input.tableName, input.columns, input.values);
//         console.log(rs);
//         let rows = await db.retrieveAll(input.tableName);
//         console.log(rows);
//         let row = await db.retrieveByID(input.tableName, '1')
//         console.log(row);
//         dbConnection.closeDatabase();
//     } catch(err){
//         console.error(err)
//     }
// }
//
// run();

/**********
* ARCHIVE: 
**********/
// Promise version, doesn't work
// dbObj.createDatabase()
//     .then(dbInstance => new SqliteDAO(dbInstance))
//     .then(dao => { 
//         const res = dao.createTable(statement)
//         return {dao, res}
//     })
//     .then(({dao, res}) => {
//         console.log(res);
//         const results = dao.query(stmt3)
//         return {dao, results}
//     })
//     .then(({dao, results}) => {
//         console.log(results)
//         const res = dao.insert(input.tableName, input.columns, input.values)
//         return {dao, res}
//     })
//     .then(({dao, results}) => {
//         console.log(results)
//         dbObj.closeDatabase()
//     })