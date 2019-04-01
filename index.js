process.env.ORA_SDTZ = 'UTC';
'use strict';

const express = require('express');
var bodyParser = require('body-parser')
// Constants
const PORT = 8080;
const HOST = 'localhost';

const dbmanager = require("./dbmanager.js")

// App
const app = express();
// parse application/json
app.use(bodyParser.json())

app.get('/dropTable', async (req, res) => {
    let resDB = await dbmanager.dropTable()
    res.send(resDB);
});

// App
app.get('/createTable', async (req, res) => {
    let resDB = await dbmanager.createTable()
    res.send(resDB);
});

// App
app.post('/insertValue', async (req, res) => {
  let resDB = await dbmanager.insertValue(req.body.orderId ,req.body)
  res.send(resDB);
});

// App
app.post('/queryTable', async (req, res) => {
  let resDB = await dbmanager.queryTable(req.body.orderId)
  res.send(resDB);
});

// App
app.get('/lastInsert', async (req, res) => {
  let resDB = await dbmanager.queryTableAll()
  resDB.rows.forEach(element => {
    element.DATA.dateTimeOrderTaken
  });
  res.send(resDB);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

