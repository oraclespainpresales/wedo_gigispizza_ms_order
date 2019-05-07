process.env.ORA_SDTZ = 'UTC';
'use strict';

const express = require('express');
var bodyParser = require('body-parser')

// Constants
const PORT = 8080 || process.env.ORD_PORT;
const HOST = '0.0.0.0' || process.env.ORD_HOST;

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
  let now = new Date();
  let month = now.getMonth() + 1
  let orderId = now.getFullYear().toString() + month.toString() + now.getDate().toString() + now.getSeconds().toString()
  let record = req.body
  record['orderId'] = orderId
  let resDB = await dbmanager.insertValue(orderId ,record)
  resDB['orderId'] = orderId
  res.send(resDB);
});

/* Get Order
*  Payload:
*  {"orderId":"#ID"}
*/
app.post('/queryTable', async (req, res) => {
  if(req.body['orderId'] == null || req.body['orderId'] == ""){
    let resDB = await dbmanager.queryTableAll()
    let resList = []
    resDB.rows.forEach(element => {
      resList.push(JSON.parse(element.DATA))
    });
    console.log("INFO queryTable: " + resList)
    res.send(resList);
  }else{
    let resDB = await dbmanager.queryTable(req.body.orderId)
    res.send(resDB);
}
});

//Get the last element inserted
app.get('/getAll', async (req, res) => {
  let resDB = await dbmanager.queryTableAll()
  resDB.rows.forEach(element => {
    element.DATA.dateTimeOrderTaken
  });
  res.send(resDB);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

