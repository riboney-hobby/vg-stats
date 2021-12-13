// src: https://github.com/jsdoc/jsdoc/issues/1537

// TODO: figure out how to export type defintions

/**
 * @typedef sqlite3.Database - Represents SQLite3 database instance
 * @type {object}
 * @property {string} - filepath to the sqlite3 database file to open/create; use `:memory:` for in-memory database
 * @property {number} - OPEN_READONLY, OPEN_READWRITE, OPEN_CREATE (default: OPEN_READWRITE | OPEN_CREATE)
 * @property {callback=} - optional callback to run while opening database and to catch errors
 * 
*/

