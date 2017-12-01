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
var colors = ['#28a745', '#dc3545', '#007bff', '#ffc107', '#ff7c00'];

console.log('OG: ', colors);

var players = {};


io.sockets.on('connection', (socket) => {
    var id = socket.id;
    players[socket.id] = {color: colors.pop()};
    console.log("JOINED: ", players[socket.id].color)
    //io.emit('join', players);
    
    socket.on('join', function (data) {
        io.emit('init_player', players);
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