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
