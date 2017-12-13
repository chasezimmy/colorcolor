'use strict';

const express = require('express');

const path = require('path');

const PORT = process.env.PORT || 3700;

const app = express();
const io = require('socket.io').listen(app.listen(PORT));

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));


/* ROUTES */
app.get('/', function(req, res) {
    res.render('index', {
        guid: ID(),
    });
});

app.get('/g/:guid', function(req, res) {
    var guid = req.params.guid
    res.render('game', {
        guid: guid,
    });
});

var rooms = {};
var colors = [];
var active_board = [];

var ID = function() {
    return Math.random().toString(36).substr(2, 9);
}

io.sockets.on('connection', (socket) => {

    console.log("Connected: ", socket.id);


    socket.on('joinRoom', function(player) {
        
        socket.join(player.room);
        console.log('Connecting ', socket.id, ' to room ', player.room);

        
        if (Object.keys(io.sockets.adapter.rooms[player.room]['sockets']).length <= 1) {
            rooms[player.room] = [];
            colors = ['#28a745', '#ff7c00', '#007bff', '#ffc107', '#dc3545'];
        }

        //console.log("room: ", io.sockets.adapter.rooms)
        
        if (!active_board.includes(player.room)) {
            active_board.push(player.room);
        }

        rooms[player.room][socket.id] = {color: '', username : player.username, room : ''};

        var color = colors.pop();
        rooms[player.room][socket.id].color = color;
//        rooms[player.room][socket.id].username = player.username;
        rooms[player.room][socket.id].room = player.room
        io.sockets.emit('notification_join', rooms[player.room][socket.id]);
        io.sockets.in(socket.id).emit('init_player', rooms[player.room][socket.id]);
      
    });

    socket.on('draw', function (data) {
        io.to(data.room).emit('drawing', data);
    });


    socket.on('disconnect', function () {
        io.sockets.emit('notification_disconnect', socket.id);
        console.log("Disconnect: ", socket.id)
    });

    socket.on('clear', function (data) {
        io.to(data.room).emit('notification_clear', data.color);
        io.to(data.room).emit('clearing', data.color);
    });

    socket.on('reset', function () {
        colors = ['#28a745', '#ff7c00', '#007bff', '#ffc107', '#dc3545'];
        //delete rooms[data.room][]
    });



    /* Game Chat */
    socket.emit('message', { message: "Welcome to the chat", username: ""});
    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });

});

console.log("Listening on port " + PORT);
setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
setInterval(() => io.emit('score'), 1000);
setInterval(() => io.emit('public_rooms', active_board), 5000);