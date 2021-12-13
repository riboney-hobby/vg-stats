const open = require('fs').createReadStream
const readline = require('readline')

const configs = require('./configs')
const csvSchema = require('../../csv_schemas');
const DbManager = require('../db');
const d = require('../utils');
const tokenizer = require('../../../utils/csv-utils');
const {checkFileExists} = require('../../../utils/file-utils')
const obj_utils = require('../../../utils/obj-utils');
const misc_utils = require('../../../utils/misc-utils');


function main({dbConnection, tableNames, createStmts}){

    checkFileExists(configs.CSV_FILE)
        .then(() => dbConnection.createDatabase())
        .then(db => d.initTables(db, tableNames, createStmts))
        .then(db => processCSV(db))
        .then(({db, inserts}) => processInserts(db, inserts))
        .then(db => d.showAllTables(db, tableNames))
        .then(() => dbConnection.closeDatabase())
        .catch(err => { 
            console.error(err, '\nExiting program!');
            // src: https://stackoverflow.com/a/37592669
            process.exitCode = 1;
        })
}

function setup(){
    const dbConnection = new DbManager(configs.DB_CONFIGS);

    const dbSchema = (function() {
        let names = new Map();
        for( let [key, val] of Object.entries(configs.TBL)){
            names.set(val.table, val)
        }
        return names;
    })();
    
    const tableNames = ((function(){const arr = []; dbSchema.forEach(item => arr.push(item.table)); return arr})()), 
    const createStmts = configs.CREATE_TABLE_STMTS;

    return {
        dbConnection,
        tableNames,
        createStmts
    }
}

function processCSV(db){
    const stream = readline.createInterface({input: open(configs.CSV_FILE)})
    let isFirstLine = true;
    let promisedInserts = [];
    
    return new Promise( (resolve, reject) => {
        stream.on('line', line => {
            if(!isFirstLine) {promisedInserts.push(processCSVLine(db, line));}
            else isFirstLine = false; /* skip first line in CSV file*/
        })
        stream.on('error', err => reject(err))
        stream.on('close', () => resolve({db: db, inserts: promisedInserts}))
    })
}

function processCSVLine(db, line){
    const dto = createDTO(line);
    const insertStmts = configs.generateInserts(dto);

    return d.insertMany(db, insertStmts);
}

function createDTO(line){
    const numOfValuesInCSVLine = Object.entries(csvSchema).length;
    const extractedData = tokenizer(line, numOfValuesInCSVLine);
    
    return obj_utils.mapValuesToObject(extractedData, csvSchema)
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

main(setup());
