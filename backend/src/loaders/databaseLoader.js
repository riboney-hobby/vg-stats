const {
    initTable,
    createSale,
    getAllSales,
} = require('../data/sqllite/repos/Sales.repo')

const {createDB} = require('../data/sqllite/sqlite.dao')

// TODO: refactor this
createDB();

initTable()
    .then(res => { 
        console.log('Init table: ', res)
        return createSale({rank: 1, name: 'Donkey Kong'})
    })
    .then((res) => {
        console.log(res)
        return createSale({rank: 2, name: 'Roblox'})
    })
    .then((res) => { 
        console.log(res)
        return createSale({rank: 3, name: 'Street Fighters'})
    })
    .then((res) => {
        console.log(res)
        return getAllSales()
    })
    .then(console.log)
    