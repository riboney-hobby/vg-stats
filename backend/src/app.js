const express = require('express');

const app = express();

app.get('/', (req, res) => res.send('Hello World'));

const port = process.env.PORT || 8000;

const start = () => app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

module.exports = start;