const dbu = require('../db-utils');

describe('test table name extraction functions', () => {
  test('Tests getTableFromCreate()', () =>{
    const stmt = `CREATE TABLE genre (
        genre_id INTEGER PRIMARY KEY,
        genre TEXT UNIQUE NOT NULL 
    );`

    const results = dbu.getTableFromCreate(stmt);

    expect(results).toBe('genre');
  });

  test('Tests getTableFromInsert()', () =>{
    const stmt = `INSERT INTO genre
                  (genre)
                  VALUES
                  ('Platform')`;
    const results = dbu.getTableFromInsert(stmt);

    expect(results).toBe('genre');
  });

  test('Tests getTableFromInsert() when statement includes with IGNORE', () =>{
    const stmt = `INSERT OR IGNORE INTO genre
                  (genre)
                  VALUES
                  ('Platform')`;
    const results = dbu.getTableFromInsert(stmt);

    expect(results).toBe('genre');
  });

  test('Tests getTableFromDrop()', () =>{
    const stmt = `DROP TABLE genre`;
    const results = dbu.getTableFromDrop(stmt);

    expect(results).toBe('genre');
  });

  test('Tests getTableFromDrop() includes IF EXISTS', () =>{
    const stmt = `DROP TABLE IF EXISTS genre`;
    const results = dbu.getTableFromDrop(stmt);

    expect(results).toBe('genre');
  })
})