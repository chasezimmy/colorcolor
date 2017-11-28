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
    //.use((req, res) => res.sendFile(INDEX), express.static(__dirname + '/public'));
    //.listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = require('socket.io').listen(app.listen(PORT));
//const io = socketIO(app);

io.sockets.on('connection', (socket) => {
    //console.log('Client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));
    
    socket.on('draw', function (data) {
        io.emit('drawing', data);
    });
});
console.log("Listening on port " + PORT);
setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
setInterval(() => io.emit('score'), 1000);