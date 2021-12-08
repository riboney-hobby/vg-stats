const SqliteManager = require('./sqlite.manager')

/**
 * Represents the actions that can be done with SQLite database
 * 
 * @constructor
 * @param {Object} dbInstance - Represents SQLite database instance; Must be provided 
 */
function SqliteDAO(dbInstance) {
    this.dbInstance = dbInstance;
}


/**
 * For any general query that is expected returns some result set
 * 
 * @param {string} sqlQuery - Non parameterized SQL query
 * @returns 
 */
 SqliteDAO.prototype.query = function(sqlQuery) {
    return new Promise((resolve, reject) => {
        if(!this.dbInstance) reject(new Error('Database is not connected!'));

        this.dbInstance.all(sqlQuery, params=[], function(err, rows){
            if(err) reject(err)
            else resolve(rows)
        })
    })
}

/**
 * Runs any queries like INSERTS, UPDATES, etc that doesn't return the resultset
 * 
 * @param {string} query - SQL query that changes some aspect of the table
 * @param {*} values - Values for the parameters in updateQuery
 * @returns {Promise} Promise contains the ID of the last updated row and number of changes to the table
 */
 SqliteDAO.prototype.run = function (query) {
    return new Promise((resolve, reject) => {
        if(!this.dbInstance) reject(new Error('Database is not connected!'));

        this.dbInstance.run(query, params=[], function(err){
            if(err) reject(err)
            else resolve({id: this.lastID, changes: this.changes})
        })
    })
}


/**
 * Query to insert rows
 * 
 * @param {string} tableName - name of the table to insert values 
 * @param {string[]} columns - array of the names of the columns to insert values into 
 * @param {string[]} values  - values to pass into INSERT
 * 
 * @returns {Promise} Promise that contains the ID of the record inserted and the number of changes to the database table
 */
 SqliteDAO.prototype.insert = function(tableName, columns, values){

    const params = [...values];

    // Setting SQL Insert statement
    const columnString = columns.join(', ')
    const placeholders = _generatePlaceholders(values.length);
    const sql = `INSERT INTO ${tableName} (${columnString}) VALUES (${placeholders})`;

    return new Promise((resolve, reject) => {

        if(!this.dbInstance) reject(new Error('Database is not connected!'));

        this.dbInstance.run(sql, params, function(err){
            if(err) reject(err)
            else resolve({id: this.lastID, changes: this.changes})
        })
    })
}

/**
 * Utility method for generating "?" for parameterized SQL statement
 * 
 * @param {number} amount - Amount of placeholders (?) to generate for SQL statement
 * 
 * @returns {string} - String containing number of "?" equal to amount parameter
 */
 const _generatePlaceholders = (amount) => {
    let numOfPlaceholders = ''

    for(let i = 0; i<amount-1; i++) {
        numOfPlaceholders = numOfPlaceholders.concat(' ', '?,');
    }

    return numOfPlaceholders.concat(' ', '?')
}

/**
 * Retrieves record by the ID provided from tableName
 * 
 * @param {string} tableName - name of table to query 
 * @param {string} id - ID value of the record being sought
 * 
 * @returns {Promise} Promise that contains an object containing the values for the first row found
 */
 SqliteDAO.prototype.retrieveByID = function(tableName, id){
    const params = [id];

    return new Promise((resolve, reject) => {
        if(!this.dbInstance) reject(new Error('Database is not connected!'));

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
    return new Promise((resolve, reject) => {
        if(!this.dbInstance) reject(new Error('Database is not connected!'));

        this.dbInstance.all(`SELECT * FROM ${tableName}`, params=[], function(err, rows){
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
        if(!this.dbInstance) reject(new Error('Database is not connected!'));

        this.dbInstance.run(`DELETE FROM ${tableName} WHERE ID = ?`, params, function(err){
            if(err) reject(err)
            else resolve({id: this.lastID, changes: this.changes})
        })
    })
}

/**
 * 
 * @param {string} createTableStatement - SQL Create tablestatement
 * @returns {string} Returns message to indicate success
 */
 SqliteDAO.prototype.createTable = function(createTableStatement){
    return new Promise((resolve, reject) => {
        if(!this.dbInstance) reject(new Error('Database is not connected!'));

        this.dbInstance.run(createTableStatement, [], function(err){
            if(err) reject(err)
            resolve({ id: this.lastID })
        })
    })
}

module.exports = SqliteDAO;

// const statement = `
//     CREATE TABLE IF NOT EXISTS foo (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         rank INTEGER NOT NULL UNIQUE,
//         name TEXT NOT NULL)`;


// const stmt3 = `PRAGMA table_info(foo)`
// const input = {
//     tableName: 'foo',
//     columns: ['rank', 'name'],
//     values: ['1', 'Bob']
// }
// // const dbObj = new SqliteManager();

// Example how to use this class
// async function run(){
//     try{
//         const dbConnection = new SqliteManager();
//         const d = await dbConnection.createDatabase();
//         const db = new SqliteDAO(d);
//         const sm = await db.createTable(statement);
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

// run();

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