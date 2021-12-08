const SqliteManager = require('../sqlite.manager');

describe('Tests database creation and closure', () => {

    const dbManager = new SqliteManager();

    test('tests createDatabase()', () => {
        return dbManager.createDatabase()
            .then(db => expect(db.constructor.name).toBe('Database'))
               
    })

    test('tests closeDatabase()', () => {
        return dbManager.closeDatabase()
            .then(status => expect(status).toBe(true));
    })

    test('tests closeDatabase() handles when no database to close', () => {
        return dbManager.closeDatabase()
            .then(status => expect(status).toBe(false));
    })
})