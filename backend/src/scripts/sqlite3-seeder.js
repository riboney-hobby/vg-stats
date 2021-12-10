const fs = require('fs/promises');
const open = require('fs').createReadStream
const events = require('events')
const emitter = new events.EventEmitter()
const readline = require('readline')
const path = require('path')

const configs = require('../configs/sqlite-seeder-configs')
const {checkFileExists} = require('../utils/file-utils')

function main(){
    checkFileExists(configs.DATA_FILE)
        .then(() => configs.DB_MANAGER.createDatabase())
        .then(db => initTables(db))
        .then(db => processCSV(db))
        //.then(db => showTables(db))
        .then(db => showSingleTable(db, 'platform'))
        .then(() => {
            console.log('All done!')
            configs.DB_MANAGER.closeDatabase();
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
    
    return new Promise( (resolve, reject) => {
        stream.on('line', line => {
            if(isFirstLine) isFirstLine = false;
            else processCSVLine(db, line)
        })
        stream.on('error', err => reject(err))
        stream.on('close', () => resolve(db))
    })
}

function processCSVLine(db, line){
    const data = extractDataFrom(line);
    const rawTables = processData(data);
    const queries = generateQueries(rawTables);
    insertData(db, queries)
}

function extractDataFrom(line){

    const raw = lineSplitter(line);
    const arr = doubleUpQuotes(raw);


    let i = 0;
    const dataModel = Object.assign(configs.DATA_SCHEMA);

    for (let [key, value] of Object.entries(dataModel)){
        value = arr[i];
        dataModel[`${key}`] = value
        i++;
    }
    
    return dataModel;
}

function lineSplitter(line){
    const numOfColumns = Object.keys(configs.DATA_SCHEMA).length;
    let rawArr = line.split(',');

    if(rawArr.length == numOfColumns) return rawArr;
    else if(rawArr.length < numOfColumns) throw new Error('Invalid data encountered!\n');
    else {
        let firstDoubleQuotes = false;
        let lastDoubleQuotes = false;
        let arr = [...rawArr];


        for(let i = 0; i<arr.length; i++){
            if(arr[i].startsWith('"')) {
                do{
                    arr[i] = arr[i].concat('', ',' + arr[i+1]);
                    arr.splice(i+1, 1);
                    if(arr[i+1].endsWith('"')){
                        arr[i] = arr[i].concat('', ',' + arr[i+1]);
                        arr.splice(i+1, 1);
                    }
                } while(!arr[i].endsWith('"'))
            
            }
        }

        return arr;
    }
}

function doubleUpQuotes(arr){
    return arr.map(item => {
        if(item.includes("'")){
            return item.replaceAll("'", "''");
        } else return item;
    })
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

// Database utils

function initTables(db){
    if(!db) throw new Error('Database not created!')
    db.serialize(function(){ 
        destroyTables(db);
        createTables(db);
    })
    // return 
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

function showCreateTableInfo(db){
    db.each("select * from sqlite_master where type='table'", [], 
        function (err, row) {
            console.log('tables created: ', row);
        },
        function(err, numOfRows){
            console.log('num of rows ', numOfRows)
        });
}

function showTables(db){
    db.serialize(function(){
        for(let i = 0; i<configs.TABLE_NAMES.length; i++){
            db.all(`SELECT * FROM ${configs.TABLE_NAMES[i]}`, [], (err, row) => console.log('table number ', i, '\n', row))
        }
    })
}

function showSingleTable(db, tableName){
    db.serialize(function(){
        db.all(`SELECT * FROM ${tableName}`, [], (err, row) => console.log(tableName, ' ', row))
    })
}

function insertData(db, q){
    if(!db) throw new Error('Database not created!')
    const sql = q.genreInsert  + ';\n' + q.platformInsert + ';\n' + q.publisherInsert 
        + ';\n' + q.videogameInsert + ';\n' + q.vgPlatformInsert + ';\n' + q.salesInsert ;
    db.exec(sql, (err) => {
        // return err
        if(err) { 
            console.log('The error: ', sql, '\n', err)
            throw err
        }
    })
}

main();
