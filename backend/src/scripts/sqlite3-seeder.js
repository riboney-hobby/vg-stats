// X Get filepath to data source (through env variables)
// X  - Verify file exist, if not exit
// X Create sqlite database object
// X  - database filename: `../res/sqlite-vg-sales.db`
// X Create dataobject to represent CSV file table (columns are property names)
// X push CREATE TABLE statements into database 
// Open read stream on data source
// Ignore first line in data source
// Read into memory each line upto newline character
// X Split values into array, separated by commmas 
//   - X check if values.length = dataobject.keys.length
//     - X false: throw error('data format not correct!')
//     - X true: initialize dataobject with values in array
// Generate INSERT query string with values from the dataobject
// Write INSERT query string with DAO (use stmt for this)
// Repeat until EOL reached
// Execute SQL file

const fs = require('fs/promises');
const events = require('events')
const emitter = new events.EventEmitter()
const readline = require('readline')
// const fs = require('fs')
const path = require('path')

const configs = require('../configs/sqlite-seeder-configs')

function main(){
    checkFileExists(configs.DATA_FILE)
        .then(() => {
            return configs.DB_MANAGER.createDatabase();
        })
        .then(db => {
            return initTables(db);
        })
        .then(() => console.log('All done!'))
        .catch(err => { 
            console.error(err.message, '\nExiting program!');
            // src: https://stackoverflow.com/a/37592669
            process.exitCode = 1;
        })
}


function checkFileExists(filePath){
    return fs.access(filePath, fs.F_OK);
}

function initTables(db){
    if(!db) throw new Error('Database not created!')
    db.serialize(function(){ 
        destroyTables(db);
        createTables(db);
    })
    // return configs.DB_MANAGER.closeDatabase();
    return db;
}

function destroyTables(db){

    for(let i = 0; i<configs.TABLE_NAMES.length; i++){
        db.run(`DROP TABLE IF EXISTS ${configs.TABLE_NAMES[i]}`, [])
    }
}

function createTables(db){
    
    for(let i = 0; i<configs.CREATE_TABLE_STATEMENTS.length; i++){
        db.run(configs.CREATE_TABLE_STATEMENTS[i], []);
    }
}

function showTables(db){
    db.each("select * from sqlite_master where type='table'", [], 
        function (err, row) {
            console.log('tables created: ', row);
        },
        function(err, numOfRows){
            console.log('num of rows ', numOfRows)
        });
}

function extractDataFrom(line){
    const arr = line.split(',');

    if(arr.length != Object.keys(config.DATA_SCHEMA).length) throw new Error('Invalid data encountered!');

    let i = 0;
    let dataModel = {};
    for (let [key, value] of Object.entries(configs.DATA_SCHEMA)){
        value = arr[i];
        dataModel[`${key}`] = value
        i++;
    }
    return dataModel;
}

function

//main();
const line = '1,Wii Sports,Wii,2006,Sports,Nintendo,41.49,29.02,3.77,8.46,82.74'
extractDataFrom(line);