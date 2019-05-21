process.env.ORA_SDTZ = 'UTC';
'use strict';

const express = require('express');
var bodyParser = require('body-parser');
//##################Stream Messages POST###################
const axios = require('axios')

// Constants
const demozone = "MADRID";
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
  try{
    let orderId = getDateId();
    let record  = req.body
    record['orderId'] = orderId
    record['status'] = "PIZZA ORDERED" //Pizza status
    let resDB = await dbmanager.insertValue(orderId ,record)
    resDB['orderId'] = orderId
    res.send(resDB);
    //Send message to stream queue with pizza status. 
    postToStream(demozone,"ORDER-STATUS",orderId.toString(),record['status'].toString());
  }
  catch(err){
    console.error("Error: insertValue-> " + err);
  }
});

//Change pizza order status
/* updateValue
*  Payload:
*  {"orderId":"#ID","status":"#status"}
*/
app.put('/updateValue', async (req, res) => {   
  let orderid = req.body.orderId;
  let status  = req.body.status;
  console.log("Info: Param Received -> " + JSON.stringify(req.body));
  await dbmanager.updateValue(orderid,"",status).then((resDB) => { 
    res.send(resDB);
    //Send message to stream queue with pizza status. 
    postToStream(demozone,"ORDER-STATUS",orderid.toString(),status.toString());
  }).catch((err) => {
    console.log("Error: index-updateValue-> " + err);
  })    
});

/* Get Order
*  Payload:
*  {"orderId":"#ID"}
*/
app.post('/queryTable', async (req, res) => {
  let resDB;
  if(req.body['orderId'] == null || req.body['orderId'] == ""){
    if(req.body['status'] == null || req.body['status'] == ""){
      console.log("Info: Query ALL")
      resDB = await dbmanager.queryTableAll()
    }
    else {
      console.log("Info: Query status-> " + req.body['status'])
      resDB = await dbmanager.queryTableStatus(req.body['status'])
    }
    let resList = []
      resDB.rows.forEach(element => {
        resList.push(JSON.parse(element.DATA))
      });
      console.log("INFO queryTable: " + JSON.stringify(resList));
      res.send(resList);
  }
  else {
    resDB = await dbmanager.queryTable(req.body.orderId)
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

//############################ POST Axios ###################################
function postToStream(demozone,eventType,orderid,messageString) {
  // Build the post string from an object
  var post_data = JSON.stringify({
     "messages":
          [
            {
              "key": demozone + "," + orderid + "," + eventType,
              "value": messageString
            }
          ]
  });

  let config = { 
      headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(post_data)
      }
  }

  axios.post('https://soa.wedoteam.io/wedodevops/publish/madrid/devops', 
        post_data, 
        config
  ).then((res) => {
      console.log(" AXIOS statusCode: " + res.status);
      //console.log(res)
  }).catch((error) => {
      console.error("AXIOS ERROR: " + error)
  });
}
