window.onload = function () {


    /* Reset if id isn't set */
    if( socket.id == null) {
        location.reload();
    }




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
    
    player[socket.id] = username;

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
					},
					"#dc3545" : {
						"name": "red",
						"score": 0,
					},
					"#007bff" : {
						"name": "blue",
						"score": 0,
					},
					"#ffc107" : {
						"name": "yellow",
						"score": 0,
					},
					"#ff7c00" : {
						"name": "orange",
						"score": 0,
					},
                    "#000" : {
                        "name": null,
                        "score": 0,
                    }
				}

    clear.onclick = function() {
        socket.emit('clear', { color: pencil._color});
    };

    join.onclick = function() {
        socket.emit('join', player);
        pencil.enable();
        join.remove();

    };

    reset.onclick = function() {
        socket.emit('reset', player);
    };







    socket.on('init_player', function (data) {
        //playerboard.remove();
        console.log(data);
        players = data.players;
        //console.log(pencil._id);
        pencil._color = players[pencil._id].color;
        notification.append(players[data["joined_id"]].username + " has joined.\n");
        //pencil.enable();

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
        notification.append(colorNames[data.color].name + " cleared the board.\n\n");
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
        for (i in colorNames) {
            temp += i + ": " + colorNames[i].name + " (" + colorNames[i].score.toString() + ")\n";
        }
        scoreboard.value = temp;

    });


}