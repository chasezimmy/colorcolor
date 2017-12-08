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

var ID = function() {
    return Math.random().toString(36).substr(2, 9);
}

io.sockets.on('connection', (socket) => {

    console.log("Connected: ", socket.id);

    socket.on('create', function(room) {

        socket.join(room);
        console.log('Connecting ', socket.id, ' to room ', room);

        
        if (Object.keys(io.sockets.adapter.rooms[room]['sockets']).length <= 1) {
            rooms[room] = [];
            colors = ['#28a745', '#ff7c00', '#007bff', '#ffc107', '#dc3545'];
        }
        
        rooms[room][socket.id] = {color: '', username : '', room : ''};
        console.log(room);
        var color = colors.pop();
        rooms[room][socket.id].color = color;
        rooms[room][socket.id].username = socket.id;
        rooms[room][socket.id].room = room
        io.sockets.emit('notification_join', rooms[room][socket.id]);
        io.sockets.in(socket.id).emit('init_player', rooms[room][socket.id]);
      
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

    socket.on('reset', function (data) {
        colors = ['#28a745', '#ff7c00', '#007bff', '#ffc107', '#dc3545'];
        //delete rooms[data.room][]
    });

});

console.log("Listening on port " + PORT);
setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
setInterval(() => io.emit('score'), 1000);