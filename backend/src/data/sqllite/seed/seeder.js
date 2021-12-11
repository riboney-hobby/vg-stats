const fs = require('fs/promises');
const open = require('fs').createReadStream
const events = require('events')
const emitter = new events.EventEmitter()
const readline = require('readline')
const path = require('path')

const configs = require('../../../configs/sqlite-seeder-configs')
const {checkFileExists} = require('../../../utils/file-utils')
const tokenizer = require('../../../utils/csv-utils');
const dbAction = require('../utils');

// const DB_CONNECTION = new dbManager(DB_CONFIGS);

function main(){
    checkFileExists(configs.DATA_FILE)
        .then(() => configs.DB_CONNECTION.createDatabase())
        .then(db => dbAction.initTables(db, {tableNames: configs.TABLE_NAMES, createStmts: configs.CREATE_TABLE_STATEMENTS}))
        .then(db => processCSV(db))
        .then(({db, inserts}) => {
            let start = Date.now();
            Promise.all(inserts)
                .then(() => {
                    let end = Date.now();
                    console.log('Inserted ', inserts.length, ' items');
                    let unformattedTime = (end - start)/1000
                    // src: https://stackoverflow.com/a/11832950
                    let formattedTime = Math.round((unformattedTime + Number.EPSILON) * 100)/100;
                    console.log(`Execution time: ${formattedTime} seconds`)

            })
            return db;
        })
        //.then(db=>dbAction.showAllTables(db))
        //.then((db) => showSingleTable(db, 'genre'))
        .then(() => {
            configs.DB_CONNECTION.closeDatabase();
        })
        .catch(err => { 
            console.error(err.message, '\nExiting program!');
            // src: https://stackoverflow.com/a/37592669
            process.exitCode = 1;
        })
}

function processCSV(db){
    const stream = readline.createInterface({input: open(configs.DATA_FILE)})
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

// function processCSVLine(db, line){
//     const data = extractDataFrom(line);
//     const rawTables = processData(data);
//     const queries = generateQueries(rawTables);
//     insertData(db, queries)
// }

function processCSVLine(db, line){
        
    const data = extractDataFrom(line);
        const rawTables = processData(data);
        const queriesArr = generateQueries(rawTables);
        const queries = queriesArr.reduce()
        return dbAction.insertMany(db, queries);
}

function createCsvDTO(line){

    const csvDataCount = configs.CSV_SCHEMA.length;
    const arr = tokenizer(line, csvDataCount);

    let i = 0;
    const dto = Object.assign(configs.CSV_SCHEMA);

    for (let [key, value] of Object.entries(dto)){
        value = arr[i];
        dto[`${key}`] = value
        i++;
    }
    
    return dto;

    // return mapValuesToObject(arr, configs.CSV_SCHEMA)
}

function processData(raw){
    return {
        genre: {
            tableName: 'genre',
            genre_name: raw.genre
        },
        platform: {
            tableName: 'platform',
            platform_name: raw.platform
        },
        videogame: {
            tableName: 'videogame',
            videogame_name: raw.name,
            publisher: raw.publisher,
            genre: raw.genre
        },
        publisher: {
            tableName: 'publisher',
            publisher_name: raw.publisher
        },
        sale: {
            tableName: 'videogame_sale',
            videogame: raw.name,
            year: raw.year,
            platform_name: raw.platform,
            naSales: raw.naSales,
            euSales: raw.euSales,
            jpSales: raw.jpSales,
            otherSales: raw.otherSales
        },
        videogamePlatform: {
            tableName: 'videogame_platform',
            videogame: raw.name,
            platform: raw.platform,
            year: raw.year === 'N/A' ? null: raw.year
        }
    }
}

function generateQueries(o){
    return {
        genreInsert : `INSERT OR IGNORE INTO ${o.genre.tableName} (genre_name) 
        VALUES ('${o.genre.genre_name}')`,
    
        platformInsert : `INSERT OR IGNORE INTO ${o.platform.tableName} (platform_name)
        VALUES ('${o.platform.platform_name}')`,

        videogameInsert : `INSERT OR IGNORE INTO ${o.videogame.tableName}
        (videogame_name, publisher_id, genre_id)
        VALUES ('${o.videogame.videogame_name}',
            (SELECT publisher_id FROM publisher WHERE publisher_name ='${o.videogame.publisher}'),
            (SELECT genre_id FROM genre WHERE genre_name = '${o.videogame.genre}'))`,

        publisherInsert: `INSERT OR IGNORE INTO ${o.publisher.tableName} (publisher_name)
        VALUES ('${o.publisher.publisher_name}')`,

        salesInsert: `INSERT INTO ${o.sale.tableName}
        (videogame_id, platform_id, na_sales, eu_sales, jp_sales, other_sales)
        VALUES (
            (SELECT v.videogame_id 
             FROM videogame v 
                INNER JOIN videogame_platform vgp
                    ON v.videogame_id = vgp.videogame_id
                INNER JOIN platform p
                    ON p.platform_id = vgp.platform_id
             WHERE v.videogame_name = '${o.sale.videogame}' AND p.platform_name = '${o.sale.platform_name}' AND vgp.year = '${o.sale.year}'),

            (SELECT p.platform_id 
            FROM platform p INNER JOIN videogame_platform vgp 
                ON p.platform_id = vgp.platform_id
            INNER JOIN videogame v
                ON v.videogame_id = vgp.videogame_id
            WHERE v.videogame_name = '${o.sale.videogame}' AND p.platform_name = '${o.sale.platform_name}' AND vgp.year = '${o.sale.year}'),
            ${o.sale.naSales},
            ${o.sale.euSales},
            ${o.sale.jpSales},
            ${o.sale.otherSales})`,

        vgPlatformInsert: `INSERT INTO ${o.videogamePlatform.tableName} (videogame_id, platform_id, year) 
                            VALUES (
                                (SELECT videogame_id FROM videogame WHERE videogame_name = '${o.videogamePlatform.videogame}'),
                                (SELECT platform_id FROM platform WHERE platform_name = '${o.videogamePlatform.platform}'), 
                                ${o.videogamePlatform.year}
                            )`
    }
}



main();
