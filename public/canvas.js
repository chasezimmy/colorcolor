window.onload = function () {

	//var socket = io.connect();
	var canvas = document.getElementById("myCanvas");
	var clear = document.getElementById("clear");
    var reset = document.getElementById("reset");
    var playerboard = document.getElementById("join");
	var scoreboard = document.getElementById("score");
    var notification = document.getElementById("notification");

    //var username = "" || "chasezimmy";
    var username = prompt("username", "Username");
    var uuid = socket.id;
    var player = {};
    
    player[socket.id] = {username: username, room: ''};

	canvas.width = 700;
	canvas.height = 500;

    /* Initiating new players */
    pencil = new Pencil(document.getElementById('myCanvas'), {
        pixelSize: 10,
        id: socket.id,
        socket: socket,

    });




	colorNames = {
					"#28a745" : {
						"name": "green",
						"score": 0,
                        "username": '',
					},
					"#dc3545" : {
						"name": "red",
						"score": 0,
                        "username": '',
					},
					"#007bff" : {
						"name": "blue",
						"score": 0,
                        "username": '',
					},
					"#ffc107" : {
						"name": "yellow",
						"score": 0,
                        "username": '',
					},
					"#ff7c00" : {
						"name": "orange",
						"score": 0,
                        "username": '',
					},
                    "#000" : {
                        "name": null,
                        "score": 0,
                        "username": '',
                    }
				}

    clear.onclick = function() {
        socket.emit('clear', { color: pencil._color, room: pencil._room});
    };

    reset.onclick = function() {
        socket.emit('reset', player);
    };


    var sid = document.getElementById('sid');




    socket.on('init_player', function (data) {
        pencil._color = data.color;
        colorNames[data.color].username = username;
        pencil._room = data['room'];

        sid.innerHTML = "ID: " + socket.id;
        
        //player[socket.id] = { username : username, room : data['room'] };
        //console.log(player)
        pencil.enable();

    });

    socket.on('notification_join', function(data) {
        notification.append(data.username + " has joined.\n");
    });

    socket.on('notification_disconnect', function(data) {
        notification.append(data + " has left.\n");
    });

    socket.on('notification_clear', function(data) {
        notification.append(colorNames[data].name + " cleared the board.\n");
    });




    /* Drawing logic between users */
	socket.on('drawing', function (data) {
		if(data) {
			pencil.drawPixel(data);
		} else {
			console.log("There is a problem:", data);
		}
	});

    /* Clear canvas and pixel object */
    socket.on('clearing', function (data) {
        pencil._clearCanvas();
        pencil._pixels = {};
    });




    // non-optimal way of presenting scoreboard
    socket.on('score', function () {
        var arr = pencil._pixels;
        for (i in colorNames) {
            colorNames[i].score = 0;
        }

        for (var x in arr) {
            for (var y in arr[x]) {
                color = arr[x][y];
                colorNames[color]["score"] = colorNames[color]["score"] ? colorNames[color]["score"] + 1 : 1;
            }
        }
        var temp = "";

        var max = 0;
        var maxColor = '';

        for (i in colorNames) {
            temp += i  + ": " + colorNames[i].name + " (" + colorNames[i].score.toString() + ")\n";

            if (colorNames[i].score > max) {
                max = colorNames[i].score;
                maxColor = i; 
            }
        }
        scoreboard.value = temp;
        scoreboard.style.color = maxColor;

    });


}