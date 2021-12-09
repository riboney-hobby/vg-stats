const path = require('path');
const sqlite3 = require('sqlite3');

const dbManager = require('../data/sqllite/sqlite.manager');
const projectRootPath = require('../utils/file-utils').getProjectRootDir()

const DATA_FILE = path.join(projectRootPath, 'res/vgsales.csv');
const SQL_FILE = path.join(projectRootPath, 'res/sqlite-init.sql');
const DB_FILE = path.join(projectRootPath, '/res/sqlite-vg-sales.db');
const DB_CONFIGS ={
    filepath: DB_FILE,
    mode: [sqlite3.OPEN_CREATE, sqlite3.OPEN_READWRITE],
    callback: function(err) { 
        if (err) throw err;
        console.log('Database connecting...');
    }
};
const DB_MANAGER = new dbManager(DB_CONFIGS);

const DATA_SCHEMA = {
    rank: 0,
    name: '',
    platform: '',
    year: '',
    genre: '',
    publisher: '',
    naSales: 0,
    euSales: 0,
    jpSales: 0,
    otherSales: 0,
    globalSales: 0
}


const CREATE_VIDEOGAME_TABLE = `
CREATE TABLE videogame (
    videogame_id INTEGER PRIMARY KEY,
    year TEXT NOT NULL,
    publisher_id INTEGER,
    genre_id INTEGER,
    FOREIGN KEY (publisher_id) REFERENCES publisher (publisher_id)
            ON UPDATE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genre (genre_id)
            ON UPDATE CASCADE
)
`

const CREATE_PUBLISHER_TABLE = `
CREATE TABLE publisher (
    publisher_id INTEGER PRIMARY KEY,
    publisher_name TEXT NOT NULL
)
`

const CREATE_GENRE_TABLE = `
CREATE TABLE genre (
    genre_id INTEGER PRIMARY KEY,
    genre_name TEXT NOT NULL
)
`

const CREATE_VIDEOGAMESALE_TABLE = `
CREATE TABLE videogame_sale (
    sale_id INTEGER NOT NULL,
    videogame_id INTEGER NOT NULL,
    na_sales INTEGER DEFAULT 0,
    eu_sales INTEGER DEFAULT 0,
    jp_sales INTEGER DEFAULT 0,
    other_sales INTEGER DEFAULT 0,
    PRIMARY KEY (sale_id, videogame_id),
    FOREIGN KEY (videogame_id) REFERENCES videogame
            ON UPDATE CASCADE
            ON DELETE CASCADE
)
`

const CREATE_PLATFORM_TABLE = `
CREATE TABLE platform (    
    platform_id INTEGER PRIMARY KEY,
    platform_name TEXT NOT NULL
)
`

const CREATE_VIDEOGAMEPLATFORM_TABLE = `
CREATE TABLE videogame_platform (
    videogame_id INTEGER NOT NULL,
    platform_id INTEGER NOT NULL,
    PRIMARY KEY (videogame_id, platform_id),
    FOREIGN KEY (videogame_id)
        REFERENCES videogame
            ON DELETE CASCADE,
    FOREIGN KEY (platform_id)
        REFERENCES platform
            ON DELETE CASCADE
        
)
`

const CREATE_TABLE_STATEMENTS = [
    CREATE_GENRE_TABLE,
    CREATE_PLATFORM_TABLE,
    CREATE_VIDEOGAME_TABLE,
    CREATE_PUBLISHER_TABLE,
    CREATE_VIDEOGAMESALE_TABLE,
    CREATE_VIDEOGAMEPLATFORM_TABLE
]

const TABLE_NAMES = [
    'genre',
    'platform',
    'videogame',
    'publisher',
    'videogame_sale',
    'videogame_platform'
]

module.exports = {
    DATA_FILE,
    SQL_FILE,
    DB_FILE,
    DB_MANAGER,
    DATA_SCHEMA,
    CREATE_TABLE_STATEMENTS,
    TABLE_NAMES
    
};
