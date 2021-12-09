# Notes

These are my notes based on this project that will be used for future reference

## Backend Setup

1. Create project directory
2. CD into the directory
3. `git init` in directory
4. Add [`.gitignore`](https://github.com/github/gitignore/blob/master/Node.gitignore)
5. `npm init`
6. `npm i express dotenv morgan`
7. `npm install --save-dev eslint prettier`
8. `npx eslint --init` (sets up eslint)
9. Add `.eslintignore` with `node_modules/`
10. Scripts to add to `package.json`
    ```json
        "start": "node src/index.js",
        "lint": "eslint **/*.js"
    ```

## SQLite

- Resources
  - [SQLite nodejs docs](https://github.com/mapbox/node-sqlite3/wiki)
  - [Tutorial I followed](https://stackabuse.com/a-sqlite-tutorial-with-node-js/)

- Install: `npm i sqlite3`
- SQL queries all run in parallel
  - To ensure things run one at a time, sequentially, you must promisfy or use [`db.Serialize()`](https://github.com/mapbox/node-sqlite3/wiki/Control-Flow)
- `params` don't work for table names; you must provide the tablename manually
