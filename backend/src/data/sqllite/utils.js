const configs = require('../../configs/sqlite-seeder-configs')

function SqliteUtils (){}

SqliteUtils.prototype.initTables = function(db, {tableNames, createStmts}){
    

    return new Promise((resolve, reject) => {

        if(!db) reject(new Error('Database not created!'));
        if(!tableNames || !createStmts) reject(new Error('Database configs not provided!'));

        db.serialize(() => { 
            try{
                this._destroyTables(db, tableNames);
                this._createTables(db, createStmts);
            } catch(err){
                console.log('Error in database initialization!')
                reject(err);
            }
        })
        
        resolve(db)
    })
}

SqliteUtils.prototype._destroyTables = function(db, tableNames){
    
    if(!tableNames) throw new Error('No table names provided!')
    tableNames.forEach(name =>
         db.run(`DROP TABLE IF EXISTS ${name}`, []))
}

SqliteUtils.prototype._createTables = function(db, createStmts){
    
    if(!createStmts) throw new Error('CREATE TABLE statements missing!')
    createStmts.forEach(stmt => db.run(stmt, []))
}

SqliteUtils.prototype.showCreateTableInfo = function(db){

    const stmt = "SELECT * FROM sqlite_master WHERE type='table'";

    new Promise( (resolve, reject) => {

        if(!db) reject(new Error('Database not created!'));

        db.all(stmt, [], (err, rows) => {
            if(err) reject(err);
            else console.log('Table information:\n', rows);
        });

        resolve(db);
    })
}

SqliteUtils.prototype.showAllTables = function(db, tableNames){
    return new Promise((resolve, reject) => {
        if(!db) reject(new Error('Database not created!'));
        if(!tableNames) reject(new Error('Cannot show table, table name not provided!'));

        const perRowCB = (err, row) => {
            if(err) reject(err);
            else console.log('Table: ', row)
        }
    
        const afterAllRowsCB = (err, numOfRows) => {
            if(err) reject(err);
            else {
                console.log('Total number of rows retrieved: ', numOfRows);
                resolve();
            }
        }

        db.serialize(function(){
            for(let i = 0; i<configs.TABLE_NAMES.length; i++){
                db.each(`SELECT * FROM ${tableNames[i]}`, [], perRowCB, afterAllRowsCB)
            }
        })
    })
}

SqliteUtils.prototype.showSingleTable = function(db, tableName){
    return new Promise((resolve, reject) => {
        if(!db) reject( new Error('Database not created!'));
        if(!tableName) reject(new Error('Cannot show table, table name not provided!'));
        
        db.serialize(function(){
            db.all(`SELECT * FROM ${tableName}`, [], (err, row) =>  { 
                if(err) reject(err);
                else {
                    console.log(tableName, ' ', row);
                    resolve(db);
                }
            });
        })
    })
}

SqliteUtils.prototype.insertMany = function(db, queries){
    return new Promise( (resolve, reject) => {
        const startsWithInsert = queries.subString(0,5).toUpperCase().startsWith('INSERT');
        
        if(!db) reject(new Error('Database not created!'));
        if(!queries || !startsWithInsert) reject(new Error('!Insert queries not provided!'));

    
        db.exec(queries, (err) => {
            if(err) { 
                console.log('The error: ', queries, '\n', err);
                reject(err);
            } else {
                //console.log('Process pending...')
                resolve();
            }
        });
    })
}

module.exports = new SqliteUtils();

// function main(){
//     const d = new SqliteUtils();
//     configs.DB_MANAGER.createDatabase()
//         .then(db => d.initTables(db, {tableNames: configs.TABLE_NAMES, createStatements: configs.CREATE_TABLE_STATEMENTS}))
//         .then(db => d.showCreateTableInfo(db))
//         .then(db => processCSV(db))
//         .then(db=>showTables(db))
//         .then(db => d.showSingleTable(db, 'genre'))
//         .then(() => {
//             configs.DB_MANAGER.closeDatabase();
//         })
//         .catch(err => { 
//             console.error(err, '\nExiting program!');
//             // src: https://stackoverflow.com/a/37592669
//             process.exitCode = 1;
//         })
// }

// main();