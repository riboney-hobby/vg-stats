const path = require('path');
const sqlite3 = require('sqlite3');


const dbManager = require('../data/sqllite/manager');
const projectRootPath = require('../utils/file-utils').getProjectRootDir()

//
//  File configs
//
const CSV_FILE = path.join(projectRootPath, 'res/test2.csv');
const DB_FILE = path.join(projectRootPath, '/res/sqlite-vg-sales.db');

//
// SQLite configs
//
const DB_CONFIGS = {
    filepath: DB_FILE,
    mode: [sqlite3.OPEN_CREATE, sqlite3.OPEN_READWRITE],
    callback: function(err) { 
        if (err) throw err;
        console.log('Database connecting...');
    }
};


// 
//  Tables Statements
// 
const GENRE_TABLE = `
CREATE TABLE genre (
    genre_id INTEGER PRIMARY KEY,
    genre_name TEXT UNIQUE NOT NULL 
)
`;

const PLATFORM_TABLE = `
CREATE TABLE platform (    
    platform_id INTEGER PRIMARY KEY,
    platform_name TEXT UNIQUE NOT NULL 
)
`;

const VIDEOGAME_TABLE = `
CREATE TABLE videogame (
    videogame_id INTEGER PRIMARY KEY,
    videogame_name TEXT NOT NULL UNIQUE,
    publisher_id INTEGER,
    genre_id INTEGER,
    FOREIGN KEY (publisher_id) REFERENCES publisher (publisher_id)
            ON UPDATE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genre (genre_id)
            ON UPDATE CASCADE
)
`;

const PUBLISHER_TABLE = `
CREATE TABLE publisher (
    publisher_id INTEGER PRIMARY KEY,
    publisher_name TEXT UNIQUE NOT NULL
)
`;

const VIDEOGAMESALE_TABLE = `
CREATE TABLE videogame_sale (
    sale_id INTEGER PRIMARY KEY,
    videogame_id INTEGER,
    platform_id INTEGER,
    na_sales INTEGER DEFAULT 0,
    eu_sales INTEGER DEFAULT 0,
    jp_sales INTEGER DEFAULT 0,
    other_sales INTEGER DEFAULT 0,
    FOREIGN KEY (videogame_id) REFERENCES videogame
            ON UPDATE CASCADE
            ON DELETE CASCADE
    FOREIGN KEY (platform_id) REFERENCES platform
            ON UPDATE CASCADE
            ON DELETE CASCADE
)
`;

const VIDEOGAMEPLATFORM_TABLE = `
CREATE TABLE videogame_platform (
    videogame_id INTEGER NOT NULL,
    platform_id INTEGER NOT NULL,
    year TEXT DEFAULT '9999',
    PRIMARY KEY (videogame_id, platform_id, year),
    FOREIGN KEY (videogame_id)
        REFERENCES videogame
            ON DELETE CASCADE,
    FOREIGN KEY (platform_id)
        REFERENCES platform
            ON DELETE CASCADE)
`;

const CREATE_TABLE_STATEMENTS = [
    GENRE_TABLE,
    PLATFORM_TABLE,
    VIDEOGAME_TABLE,
    PUBLISHER_TABLE,
    VIDEOGAMESALE_TABLE,
    VIDEOGAMEPLATFORM_TABLE
];

const TABLE_NAMES = {
    genre: 'genre',
    platform: 'platform',
    videogame: 'videogame',
    publisher: 'publisher',
    videogame_sale: 'videogame_sale',
    videogame_platform: 'videogame_platform'
};

module.exports = {
    CREATE_TABLE_STATEMENTS,
    TABLE_NAMES
};