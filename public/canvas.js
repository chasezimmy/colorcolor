window.onload = function () {

	//var socket = io.connect();
	var canvas = document.getElementById("myCanvas");
	var clear = document.getElementById("clear");
    var playerboard = document.getElementById("join");
	var scoreboard = document.getElementById("score");
    var notification = document.getElementById("notification");

    var player = {};
	canvas.width = 700;
	canvas.height = 500;

	//colorArray = ['#28a745', '#dc3545', '#007bff', '#ffc107', '#ff7c00'];
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
                        "name": "null",
                        "score": 0,
                    }
				}

	//randomColor = colorArray[Math.floor(Math.random() * colorArray.length)];
    console.log(socket.id);
    if( socket.id == null) {
        location.reload();
    }


    var pencil = new Pencil(document.getElementById('myCanvas'), {
        pixelSize: 10,
        id: socket.id,
        socket: socket,
        color: '#000'
        //socket: socket,

    });





	socket.on('drawing', function (data) {
		if(data) {
			pencil.drawPixel(data);
		} else {
			console.log("There is a problem:", data);
		}
	});

    clear.onclick = function() {
        socket.emit('clear', { color: pencil._color});
    };

    join.onclick = function() {
        socket.emit('join');
    };

    socket.on('init_player', function (data) {
        playerboard.remove();
        console.log(data);
        console.log(pencil._id);
        pencil._color = data[pencil._id].color;
        pencil.enable();

    });

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