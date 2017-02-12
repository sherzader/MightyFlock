var fs = require('fs');
var db = 'scraps.json';
var userTokens = {};

exports.getUserToken = function (userId) {
    return userTokens[userId];
}

exports.saveUserToken = function (userId, token) {
    userTokens[userId] = token;
}

var chats = {};

var conversationId = function (userId, chat) {
    if (chat.startsWith('u:') || chat.startsWith('b:')) {
        return [userId, chat].sort().join('|');
    } else {
        return chat;
    }
}

exports.saveScrap = function (userId, chat, text) {
    var cid = conversationId(userId, chat);
    if (!chats[cid]) {
        chats[cid] = [text];
    } else {
        chats[cid].push(text);
    }
};

exports.listScraps = function (userId, chat) {
    return chats[conversationId(userId, chat)];
};

var readDatabase = function () {
    try {
        var stringContent = fs.readFileSync(db);
        var content = JSON.parse(stringContent);
        userTokens = content.userTokens;
        chats = content.chats;
    } catch (e) {
        console.log('Couldn\'t read db, starting empty.\nError:', e);
    }
};

var saveDatabase = function () {
    console.log('Saving db');
    var stringContent = JSON.stringify({ userTokens: userTokens, chats: chats });
    fs.writeFileSync(db, stringContent);
};

readDatabase();
process.on('SIGINT', function () { console.log('SIGINT'); process.exit(); });
process.on('SIGTERM', function () { console.log('SIGTERM'); process.exit(); });
process.on('exit', saveDatabase);
