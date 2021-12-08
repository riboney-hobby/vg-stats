const SqliteManager = require('../sqlite.manager');
const SqliteDAO = require('../sqlite.dao');

describe('Tests DAO methods', () => {
    const dbManager = new SqliteManager();
    let dbDAO;

    beforeAll(() => {
        return dbManager.createDatabase()
            .then(db => {
                dbDAO = new SqliteDAO(db);
            })
    })

    test('tests createTable() and query()', () => {
        const createTable = `
                CREATE TABLE IF NOT EXISTS test (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    rank INTEGER NOT NULL UNIQUE,
                    name TEXT NOT NULL)`;

        const showTableColumns = `PRAGMA table_info(test)`

        return dbDAO.createTable(createTable)
            .then(() => dbDAO.query(showTableColumns))
            .then((res) => expect(res.length).toBe(3))
    })

    test('tests insert()', () => {
        const input = {
            tableName: 'test',
            columns: ['rank', 'name'],
            values: ['1', 'Bob']
        };

        return dbDAO.insert(input.tableName, input.columns, input.values)
            .then(res => expect({id: res.id, changes: res.changes}).toEqual({id: 1, changes: 1}))
    })

    test('tests retrieveAll()', () => {
        const tableName = 'test';

        return dbDAO.retrieveAll(tableName)
            .then(rows => expect(rows).toEqual([{ id: 1, rank: 1, name: 'Bob' }]))
    })

    test('tests retrieveByID()', () => {
        const input = {
            tableName: 'test',
            columns: ['rank', 'name'],
            values: ['2', 'Joe']
        };

        return dbDAO.insert(input.tableName, input.columns, input.values)
            .then(res => dbDAO.retrieveByID(input.tableName, 2))
            .then(rows => expect(rows).toEqual({ id: 2, rank: 2, name: 'Joe' }))
    })

    test('tests run()', () => {
        const sql = `UPDATE test SET name = 'Jill' WHERE id = 2`;

        return dbDAO.run(sql)
            //.then(res => expect({id: res.id, changes: res.changes}).toEqual({id: 2, changes: 1}))
            .then(res => dbDAO.retrieveByID('test', 2))
            .then(row => expect(row).toEqual({ id: 2, rank: 2, name: 'Jill' }))
    })

    test('tests deleteByID()', () => {
        return dbDAO.deleteByID('test', 2)
            // .then(res => expect({id: res.id, changes: res.changes}).toEqual({id: 2, changes: 1}))
            .then(res => dbDAO.retrieveAll('test'))
            .then(rows => expect(rows).toEqual([{ id: 1, rank: 1, name: 'Bob' }]))
    })
})