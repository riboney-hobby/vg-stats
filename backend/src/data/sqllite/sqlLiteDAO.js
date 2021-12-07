const db = require('../../loaders/sqliteLoader').sqliteDB 

/**
 * Query to insert rows
 * 
 * @param {string} tableName - name of the table to insert values into
 * @param {string[]} values  - values to pass into INSERT
 * @returns {Promise} Promise that contains the ID of the record inserted and the number of changes to the database table
 */
const create = (tableName, columnNames, values) => {
    const columns = columnNames.join(', ')
    const params = [...values];

    let vals = valueParams(values.length);
    let insertStatement = `INSERT INTO ${tableName} (${columns}) VALUES (${vals})`;

    return new Promise((resolve, reject) => {
        db.run(insertStatement, params, function(err){
            if(err) reject(err)
            else resolve({id: this.lastID, changes: this.changes})
        })
    })
}

/**
 * 
 * @param {string} tableName - name of table to query 
 * @param {string} id - ID value of the record being sought
 * @returns {Promise} Promise that contains an object containing the values for the first row found
 */
const findByID = (tableName, id) => {
    const params = [tableName, id];

    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM ? WHERE ID = ?", params, (err, row) => {
            if(err) reject(err)
            else resolve(row)
        })
    })
}

const valueParams = (length) => {
    let numOfValues = ''

    for(let i = 0; i<length-1; i++) {
        numOfValues = numOfValues.concat(' ', '?,');
    }

    return numOfValues.concat(' ', '?')
}

/**
 * 
 * @param {string} tableName - name of the table to query
 * @returns {Promise} Promise that contains array of all rows in table
 */
const findAll = (tableName) => {
    let params = [tableName]

    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM ${tableName}`, params=[], (err, rows) => {
            if(err) reject(err)
            else resolve(rows)
        })
    })
}

/**
 * 
 * @param {string} updateQuery - Parameterized SQL UPDATE statement; should include `WHERE ID = ?`
 * @param {*} values - Values for the parameters in updateQuery
 * @returns {Promise} Promise contains the ID of the last updated row and number of changes to the table
 */
const updateByID = (updateQuery, values) => {
    return new Promise((resolve, reject) => {
        db.run(updateQuery, values, err => {
            if(err) reject(err)
            else resolve({id: this.lastID, changes: this.changes})
        })
    })
}

/**
 * 
 * @param {string} tableName  - Table to delete row from
 * @param {string} ID - ID of the row to be deleted
 * @returns {Promise} Promise contains the the ID of the last deleted row and number of changes to the table
 */
const deleteByID = (tableName, ID) => {
    const params = [tableName, ID];

    return new Promise((resolve, reject) => {
        db.run('DELETE FROM ? WHERE ID = ?', params, err => {
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
const createTable = (createTableStatement) => {
    return new Promise((resolve, reject) => {
        db.run(createTableStatement, [], err => {
            if(err) reject(err)
            resolve('Table created')
        })
    })
}

module.exports = {
    create,
    findByID,
    findAll,
    updateByID,
    deleteByID,
    createTable
}