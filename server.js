'use strict';

const express = require('express');

const path = require('path');

const PORT = process.env.PORT || 3700;
const INDEX = path.join(__dirname, 'index.html');


const app = express();
app.get('/', function(req, res) {
    res.sendFile(INDEX);
});

app.use(express.static(__dirname + '/public'));

const io = require('socket.io').listen(app.listen(PORT));
var colors = ['#28a745', '#ff7c00', '#007bff', '#ffc107', '#dc3545'];

console.log('OG: ', colors);

var players = {};

io.sockets.on('connection', (socket) => {

    // init players object to index all players in current game
    players[socket.id] = { color : colors.pop(), username : "" };

    console.log("JOINED: ", players[socket.id].color)
    
    socket.on('join', function (data) {
        players[socket.id].username = data[socket.id];
        console.log(players);
        io.emit('init_player', {players: players, "joined_id" : socket.id});
    });



    socket.on('disconnect', function () {
        colors.push(players[socket.id].color);
        console.log('LEFT: ', players[socket.id].color);
        delete players[socket.id];
    });
    
    socket.on('draw', function (data) {
        io.emit('drawing', data);
    });

    socket.on('clear', function (data) {
        io.emit('clearing', data);
    });



});

console.log("Listening on port " + PORT);
setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
setInterval(() => io.emit('score'), 1000);