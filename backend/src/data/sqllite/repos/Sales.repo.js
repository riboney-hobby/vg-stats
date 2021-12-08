// TODO: temporary for testing, refactor into proper tables later

// separate, explicit functions
const {
    create,
    findByID,
    findAll,
    updateByID,
    deleteByID,
    createTable,
} = require('../sqlite.dao')

// vs

// one namespace for all the functions
const dao = require('../sqlite.dao')

const tableName = 'Sales'

const initTable = () => {
    const statement = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rank INTEGER NOT NULL UNIQUE,
        name TEXT NOT NULL)`;
    
    return createTable(statement);
}

const createSale = (sale) => {
    return create(tableName, Object.keys(sale), [sale.rank, sale.name]);
}

const getAllSales = () => {
    return findAll(tableName)
}

module.exports = {
    initTable,
    createSale,
    getAllSales
}

// console.log('initializing table...');
// initTable();
// console.log('inserting data...');
// createSale({rank: 1, name: 'Donkey Kong'});
// createSale({rank: 2, name: 'Roblox'});
// createSale({rank: 3, name: 'Street Fighters'});
// console.log('getting all sales...');
// getAllSales();
