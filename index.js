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
  
  let orderId = getDateId();
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
  postToStream("getAll orders");
  let resDB = await dbmanager.queryTableAll()
  resDB.rows.forEach(element => {
    element.DATA.dateTimeOrderTaken
  });
  res.send(resDB);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

function getDateId(){
  let now = new Date()

  let year = now.getFullYear().toString()

  let month = now.getMonth() + 1
  month = (("0" + month).slice(-2))

  let day = now.getDate()
  day = (("0" + day).slice(-2))

  let hours = now.getHours();
  hours = ("0" + hours).slice(-2);

  let minutes = now.getMinutes()
  minutes = ("0" + minutes).slice(-2);

  let seconds = now.getSeconds()
  seconds = ("0" + seconds).slice(-2);

  let orderId = year + month + day + hours + minutes + seconds
  return orderId
}

function postToStream(codestring) {
  // Build the post string from an object
  var post_data = querystring.stringify({
     "messages":
          [
                {
                      "key": "MADRID,EVENTTYPE",
                      "value": "microservice_order"
                },
                {
                      "key": "MADRID,EVENTTYPE",
                      "value": "task: " + codestring
                }
          ]
  });

  // An object of options to indicate where to post to
  var post_options = {
      host: 'soa.wedoteam.io',
      port: '443',
      path: '/wedodevops/publish/madrid/devops',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(post_data)
      }
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });

  // post the data
  post_req.write(post_data);
  post_req.end();
}
