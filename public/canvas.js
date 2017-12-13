function joinRoom (guid) {
    var username = document.getElementById("username").value;
    if (!username.length) {
        return;
    } 
    socket.emit('joinRoom', {room : guid, username: username});
}



window.onload = function () {

    // show modal onload
    $("#modal_save").modal('show');
    var modal_save = document.getElementById("modal_save")

	//var socket = io.connect();
	var gameboard = document.getElementById("gameboard");
	var clear = document.getElementById("clear");
    var reset = document.getElementById("reset");
	var scoreboard = document.getElementById("score");
    var notification = document.getElementById("notification");

    var uuid = socket.id;

	gameboard.width = 700;
	gameboard.height = 500;

    // Grab username
    modal_save.onclick = function() {
        var username = document.getElementById("username");
        if (username.value.length) {
            $("#modal_save").modal('hide');
        }
    }




    /* Initiating new players */
    pencil = new Pencil(gameboard, {
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
					}
				}

    clear.onclick = function() {
        socket.emit('clear', { color: pencil._color, room: pencil._room});
    };

    reset.onclick = function() {
        socket.emit('reset');
    };


    var sid = document.getElementById('sid');




    socket.on('init_player', function (data) {
        pencil._color = data.color;
        colorNames[data.color].username = username;
        pencil._room = data['room'];

        sid.innerHTML = "ID: " + socket.id;
        
        pencil.enable();

    });

    socket.on('notification_join', function(data) {
        notification.append(data.username + " has joined as " + colorNames[data.color].name + ".\n");
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






    var messages = [];
    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");
    var content = document.getElementById("content");



        socket.on('message', function (data) {
        if(data.message) {

            messages.push(data);
            var html = '';
            for (var i=0; i<messages.length; i++) {
                //console.log(messages[i].username.length !=0 );
                html += '<b>' + (messages[i].username.length !=0 ? messages[i].username + ': ' : '') + '</b>';
                html += messages[i].message + '<br />';
            }
            content.innerHTML = html;
        } else {
            console.log("There is a problem:", data);
        }
    });

    sendButton.onclick = function() {
        if (username.value == "") {
            alert("Please type your name!");
        } else {
            var text = field.value;
            socket.emit('send', { message: text , username: username.value});
            //field.value = "";
        }
    };


}