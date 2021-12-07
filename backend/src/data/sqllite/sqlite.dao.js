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
 SqliteDAO.prototype.queryByID = function(tableName, id){
    const params = [tableName, id];

    return new Promise((resolve, reject) => {
        if(!this.dbInstance) reject(new Error('Database is not connected!'));

        this.dbInstance.get("SELECT * FROM ? WHERE ID = ?", params, function(err, row){
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
 SqliteDAO.prototype.queryAll = function(tableName) {
    return new Promise((resolve, reject) => {
        if(!this.dbInstance) reject(new Error('Database is not connected!'));

        this.dbInstance.all(`SELECT * FROM ${tableName}`, params=[], function(err, rows){
            if(err) reject(err)
            else resolve(rows)
        })
    })
}

/**
 * Updates record according to the updateQuery
 * 
 * @param {string} updateQuery - Parameterized SQL UPDATE statement; should include `WHERE ID = ?`
 * @param {*} values - Values for the parameters in updateQuery
 * @returns {Promise} Promise contains the ID of the last updated row and number of changes to the table
 */
 SqliteDAO.prototype.update = function (updateQuery, values) {
    return new Promise((resolve, reject) => {
        if(!this.dbInstance) reject(new Error('Database is not connected!'));

        this.dbInstance.run(updateQuery, values, function(err){
            if(err) reject(err)
            else resolve({id: this.lastID, changes: this.changes})
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
    const params = [tableName, ID];

    return new Promise((resolve, reject) => {
        if(!this.dbInstance) reject(new Error('Database is not connected!'));

        this.dbInstance.run('DELETE FROM ? WHERE ID = ?', params, function(err){
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
            console.log('in create table')
            resolve({ id: this.lastID })
        })
    })
}



module.exports = SqliteDAO;