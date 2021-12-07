const {
    create,
    findByID,
    findAll,
    updateByID,
    deleteByID,
    createTable
} = require('./sqlLiteDAO')

const tableName = 'Sales'

const initTable = () => {
    const statement = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rank INTEGER NOT NULL UNIQUE,
        name TEXT NOT NULL)`;
    
    createTable(statement).then(res => console.log('RESULT ct:', res));
}

const createSale = (sale) => {
    create(tableName, Object.keys(sale), [sale.rank, sale.name]).then(res => console.log('RESULT:', res));
}

const getAllSales = () => {
    findAll(tableName).then(res => res.forEach(r => console.log('res: ', r)))
}

// console.log('initializing table...');
// initTable();
// console.log('inserting data...');
// createSale({rank: 1, name: 'Donkey Kong'});
// createSale({rank: 2, name: 'Roblox'});
// createSale({rank: 3, name: 'Street Fighters'});
// console.log('getting all sales...');
// getAllSales();
