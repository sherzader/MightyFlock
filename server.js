const https = require('https');
const fs = require('fs');
const request = require('request');
const flock = require('flockos');
const express = require('express');
const store = require('./store');
const bodyParser = require('body-parser');
const cors = require('cors');
const qs = require('qs');
const multer  = require('multer');
const port = 9745;
const upload = multer({ dest: 'uploads/' });
const app = express();
const options = {
  // Private Key
  key: fs.readFileSync('./ssl/server.key'),

  // SSL Certficate
  cert: fs.readFileSync('./ssl/server.crt'),

  // Make sure an error is not emitted on connection when the server certificate verification against the list of supplied CAs fails.
  rejectUnauthorized: false
};

app.listen(port, function () {
  console.log('MightyFlock app listening on port 9745!')
})

app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json());
app.use(cors());

app.use('/', express.static(__dirname));

app.get('/authresponse', (req, res) => {
  res.redirect(301, `/?${qs.stringify(req.query)}`);
});

app.post('/audio', upload.single('data'), (req, res) => {
  res.json(req.file);
});

app.get('/parse-m3u', (req, res) => {
  const m3uUrl = req.query.url;
  console.log(m3uUrl)

  if (!m3uUrl) {
    return res.json([]);
  }

  const urls = [];

  request(m3uUrl, (error, response, bodyResponse) => {
    console.log(bodyResponse, m3uUrl)
    if (bodyResponse) {
      urls.push(bodyResponse);
    }

    res.json(urls);
  });
});

flock.appId = "d4ff7061-f575-4bc6-a46b-4ea4a463c8e0";
flock.appSecret = "caa05b4d-e500-4720-b443-3b1c004f5e16";
// since we use express, we can simply use the token verifier
// middleware to ensure that all event tokens are valid
app.use(flock.events.tokenVerifier);

// listen for events on /events
app.post('/events', (req, res, next) => {
    res.sendStatus(200);
    next();
}, flock.events.listener);

// listen for app.install event, mapping of user id to tokens is saved
// in the in-memory database
flock.events.on('app.install', (event, res) => {
    console.log("MADE IT");
    store.saveUserToken(event.userId, event.token);
});

flock.events.on('client.slashCommand', (event, callback) => {
    // handle slash command event here
    // invoke the callback to send a response to the event
    // callback(null, { text: 'Received your command' });
    flock.callMethod('chat.sendMessage', store.getUserToken(event.userId), {
        to: event.chat,
        text: "wuddup",
    }, (error, response) => {
        if (!error) {
            console.log(response);
        } else {
            console.log(error);
        }
    });
});
