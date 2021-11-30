# Notes

These are my notes based on this project that will be used for future reference

## Backend Setup

1. `npm init`
2. `npm i express mysql dotenv morgan`
3. `npm install --save-dev eslint prettier`
4. `npx eslint --init` (sets up eslint)
5. Add `.eslintignore` with `node_modules/`
6. Scripts to add to `package.json`
```json
    "start": "node src/index.js",
    "lint": "eslint **/*.js"
```
7. Add [`.gitignore`](https://github.com/github/gitignore/blob/master/Node.gitignore)