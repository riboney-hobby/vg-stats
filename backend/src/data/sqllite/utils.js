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
    
        const afterAllRowsCB = 

        db.serialize(function(){
            for(let i = 0; i<tableNames.length; i++){
                let results = [];
                db.each(`SELECT * FROM ${tableNames[i]}`, [], 
                /*per row callback in query*/ (err, row) => {
                    if(err) reject(err);
                    else {
                        results.push(row);
                    }
                }, 
                /*after all rows in query*/(err, numOfRows) => {
                    if(err) reject(err);
                    else {
                        console.log(`${tableNames[i]} tables:\n`, results);
                        results = [];
                        resolve();
                    }
                })
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
        const afterTabs = 5;
        const endOfWord = 11;
        const startsWithInsert = queries.substring(afterTabs, endOfWord).toUpperCase().startsWith('INSERT');
        
        if(!db) reject(new Error('Database not created!'));
        if(!queries || !startsWithInsert) reject(new Error('Insert queries not provided!'));

    
        db.serialize(function(){
            try{
                db.exec(queries, (err) => {
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

module.exports = new SqliteUtils();


