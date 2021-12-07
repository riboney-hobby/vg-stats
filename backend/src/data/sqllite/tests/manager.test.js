const SqliteManager = require('../sqlite.manager')

describe('Tests database creation and closure', () => {

    //const dbManager = new SqliteManager();

    // test('tests createDatabase()', () => {
    //     const result = dbManager.createDatabase();
    //     expect(result).toEqual({author: 'Edsger W. Dijkstra', blogs: 2})
    // })

    test('console log test', () => {
        console.log = jest.fn();
        log('hello');
        expect(console.log.mock.calls[0][0]).toBe('hello');
    })
})