window.onload = function () {

	var socket = io.connect();
	var canvas = document.getElementById("myCanvas");
	var checkScore = document.getElementById("checkScore");
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


    checkScore.onclick = function() {
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
        //console.log(colorNames);
        for (i in colorNames) {
        	//console.log(i, colorNames[i].name, colorNames[i].score);
        	temp += i + ": " + colorNames[i].name + " (" + colorNames[i].score.toString() + ")\n";
        }
        scoreboard.value = temp;
        //console.log(colorNames);
    };

    socket.on('score', function () {
    	checkScore.click();

    });


}