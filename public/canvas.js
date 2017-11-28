window.onload = function () {

	var socket = io.connect();
	var canvas = document.getElementById("myCanvas");
	var clear = document.getElementById("clear");
	var scoreboard = document.getElementById("score");
	canvas.width = 700;
	canvas.height = 500;

	colorArray = ['#28a745', '#dc3545', '#007bff', '#ffc107', '#ff7c00'];
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
				}

	randomColor = colorArray[Math.floor(Math.random() * colorArray.length)];
 	var pencil = new Pencil(document.getElementById('myCanvas'), {
		pixelSize: 10,
		color: randomColor,
		socket: socket,

	});

	pencil.enable();

	socket.on('drawing', function (data) {
		if(data) {
			pencil.drawPixel(data);
		} else {
			console.log("There is a problem:", data);
		}
	});


    clear.onclick = function() {
        pencil._clearCanvas();
        pencil._pixels = {};
    };


    // non-optimal way of presenting scoreboard
    socket.on('score', function () {
        var arr = pencil._pixels;
        for (i in colorNames) {
            colorNames[i].score = 0;
        }

        for (var x in arr) {
            for (var y in arr[x]) {
                //console.log(arr[x][y]);
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