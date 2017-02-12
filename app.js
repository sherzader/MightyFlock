var flock = require('flockos');
var express = require('express');
var util = require('util');
var express = require('express');
var mustache = require('mustache');
// var config = require('./config');
var store = require('./store');

flock.appId = "d4ff7061-f575-4bc6-a46b-4ea4a463c8e0";
flock.appSecret = "caa05b4d-e500-4720-b443-3b1c004f5e16";

var app = express();
// since we use express, we can simply use the token verifier
// middleware to ensure that all event tokens are valid
app.use(flock.events.tokenVerifier);

// listen for events on /events
app.post('/events', function(req, res, next) {
    res.sendStatus(200);
    next();
}, flock.events.listener);

// listen for app.install event, mapping of user id to tokens is saved
// in the in-memory database
flock.events.on('app.install', function (event, res) {
    console.log("MADE IT");
    store.saveUserToken(event.userId, event.token);
});

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(4040, function () {
  console.log('Example app listening on port 4040!')
})

flock.events.on('client.slashCommand', function (event, callback) {
    // handle slash command event here
    // invoke the callback to send a response to the event
    // callback(null, { text: 'Received your command' });
    flock.callMethod('chat.sendMessage', store.getUserToken(event.userId), {
        to: event.chat,
        text: "wuddup",
    }, function(error, response) {
        if (!error) {
            console.log(response);
        } else {
            console.log(error);
        }
    });
});
