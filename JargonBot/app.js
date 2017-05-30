/* jshint node: true */
'use strict'

const bodyparser = require('body-parser')
const crypto = require('crypto')
const csv = require('csv')
const express = require('express')
const fs = require('fs') 
const request = require('request')

const APP_SECRET = process.env.APP_SECRET
const VERIFY_TOKEN = process.env.VERIFY_TOKEN
const CSV_FILE_PATH = process.env.CSV_FILE_PATH

var app = express()
app.set('port', process.env.PORT || 5000)
app.use(bodyparser.json({ verify: verifyRequestSignature }))

var jargon = {};

function readJargonFile(file) {
  var parser = csv.parse({delimiter: ';'}, function(err, data){
    console.log(data);
  });

  fs.createReadStream(file).pipe(parser);
}

function verifyRequestSignature (req, res, buf) {
  var signature = req.headers['x-hub-signature']

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an
    // error.
    console.error("Couldn't validate the signature.")
  } else {
    var elements = signature.split('=')
    var signatureHash = elements[1]

    var expectedHash = crypto.createHmac('sha1', APP_SECRET).update(buf).digest('hex')

    if (signatureHash !== expectedHash) {
      throw new Error("Couldn't validate the request signature.")
    }
  }
}

app.get('/', function (req, res) {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VERIFY_TOKEN) {
    console.log('Validating webhook')
    res.status(200).send(req.query['hub.challenge'])
  } else {
    console.error('Failed validation. Make sure the validation tokens match.')
    res.sendStatus(403)
  }
});

app.put('/', function (req, res) {

});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;

readJargonFile('./jargon.csv');