process.env.ORA_SDTZ = 'UTC';
'use strict';

const express = require('express');
var bodyParser = require('body-parser')

// Constants
const PORT = 8080;
const HOST = 'localhost';

const dbmanager = require("./dbmanager.js")

const app = express();
// parse application/json
app.use(bodyParser.json())

//################## Table Management #####################
app.get('/dropTable', async (req, res) => {
    let resDB = await dbmanager.dropTable()
    res.send(resDB);
});

app.get('/createTable', async (req, res) => {
    let resDB = await dbmanager.createTable()
    res.send(resDB);
});
//################## End - Table Management #####################

/* Insert Order
*  Payload:
*  {"orderId":"#ID",
*   *whatever*}
*/
app.post('/insertValue', async (req, res) => {
  let resDB = await dbmanager.insertValue(req.body.orderId ,req.body)
  res.send(resDB);
});

/* Get Order
*  Payload:
*  {"orderId":"#ID"}
*/
app.post('/queryTable', async (req, res) => {
  let resDB = await dbmanager.queryTable(req.body.orderId)
  res.send(resDB);
});

//Get the last element inserted
app.get('/lastInsert', async (req, res) => {
  let resDB = await dbmanager.queryTableAll()
  resDB.rows.forEach(element => {
    element.DATA.dateTimeOrderTaken
  });
  res.send(resDB);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

