const fs = require('fs/promises');
const open = require('fs').createReadStream
const events = require('events')
const emitter = new events.EventEmitter()
const readline = require('readline')
const path = require('path')

const configs = require('./configs')
const {checkFileExists} = require('../../../utils/file-utils')
const tokenizer = require('../../../utils/csv-utils');
const DbManager = require('../db');
const dbAction = require('../utils');
const obj_utils = require('../../../utils/obj-utils');
const misc_utils = require('../../../utils/misc-utils');
const csvSchema = require('../../csv_schemas');



function main(){

    // setup
    //  placed here for scoping reasons
    const dbConnection = new DbManager(configs.DB_CONFIGS);

    const getTableNames = () => {
        let names = new Map();
        for( let [key, val] of Object.entries(configs.TBL)){
            names.set(val.table, val)
        }
        return names;
    }

    const tableMap = getTableNames();
    
    const initConfigs = {
        tableNames: ((function(){const arr = []; tableMap.forEach(item => arr.push(item.table)); return arr})()), 
        createStmts: configs.CREATE_TABLE_STMTS,
    };

    checkFileExists(configs.CSV_FILE)
        .then(() => dbConnection.createDatabase())
        .then(db => dbAction.initTables(db,initConfigs))
        .then(db => processCSV(db))
        .then(({db, inserts}) => processInserts(db, inserts))
        //.then(db => dbAction.showAllTables(db, initConfigs.tableNames))
        .then((db) => dbAction.showSingleTable(db, configs.TBL.genre.table))
        .then(() => {
            dbConnection.closeDatabase();
        })
        .catch(err => { 
            console.error(err, '\nExiting program!');
            // src: https://stackoverflow.com/a/37592669
            process.exitCode = 1;
        })
}

function processCSV(db){
    const stream = readline.createInterface({input: open(configs.CSV_FILE)})
    let isFirstLine = true;
    let inserts = new Array();
    
    return new Promise( (resolve, reject) => {
        stream.on('line', line => {
            if(!isFirstLine) {inserts.push(processCSVLine(db, line));}
            else isFirstLine = false;
        })
        stream.on('error', err => reject(err))
        stream.on('close', () => resolve({db: db, inserts: inserts}))
    })
}


function processCSVLine(db, line){
    const dto = createDTO(line);
    const insertStmts = configs.generateInserts(dto);
    return dbAction.insertMany(db, insertStmts);
}

function createDTO(line){
    const csvDataCount = Object.entries(csvSchema).length;
    const arr = tokenizer(line, csvDataCount);
    
    return obj_utils.mapValuesToObject(arr, csvSchema)
}

function processInserts(db, inserts){
    return new Promise( (resolve, reject) => {
        let start = Date.now();
        Promise.all(inserts)
            .then(() => {
                console.log('Inserted ', inserts.length, ' items');
                misc_utils.displayElapsedTime(start);
            })
            .catch(err => {
                console.log('Error in processing promised inserts!');
                reject(err);
            });
        resolve(db);
    })   
}

main();
