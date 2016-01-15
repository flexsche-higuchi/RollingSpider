var express = require('express');
var Drone = require('rolling-spider');
var app = express();
var UUID = '65ba853a26c140579b29e2219bed052f';

var ACTIVE = true;
var STEPS = 20;

/* 一定時間はコマンドを受け付けないようにする */
function cooldown(){
    ACTIVE = false;
    setTimeout(function() {
	    ACTIVE = true;
	}, STEPS * 12);
}

var command = '';

app.use(express.static('public'));

var drone = new Drone(UUID);

app.get('/', function (req, res) {
  res.send('ready for flight!');
});

/* 接続 */
app.get('/connect', function(req, res){
    drone.connect(function() {
        drone.setup(function(){
            console.log('Configured for Rolling Spider! ', drone.name);
            drone.flatTrim();
            drone.startPing();
            drone.flatTrim();
            res.send('Connect');
        });
    });
});

/* 離陸 */
app.get('/takeoff', function (req, res) {
	drone.takeOff(
        function(){
            res.send("takeoff");
            setInterval(
                function(){
                    switch(command){
                    case 'forward':
                        drone.forward();
                        break;
                    case 'backward':
                        drone.backward();
                        break;
                    case 'tleft':   
                        drone.turnLeft();
                        break;
                    case 'tright':   
                        drone.turnRight();
                        break;
                    }
                },
                100
            )
        }
    );
});

/* 着陸 */
app.get('/land', function (req, res) {
	res.send('Initiated Landing Sequence...');
	drone.land();
    });

/* 緊急着陸 */
app.get('/emergency', function(req, res) {
	res.send('Emergency');
	drone.emergency();
	setTimeout(function(){
		process.exit();
	    });
    });

/* 前進 */
app.get('/forward', function(req, res) {
    command = 'forward';
	res.send('Forward');
    });

/* 後進 */
app.get('/backward', function(req, res) {
    command = 'backward';
	res.send('Backward');
    });

/* 左旋回 */
app.get('/turnLeft', function(req, res) {
    command = 'tleft';
	res.send('Turn Left');
    });

/* 右旋回 */
app.get('/turnRight', function(req, res) {
    command = 'tright';
	res.send('Turn Right');
    });

app.get('/stop', function(req, res){
    command = '';
    res.send('Stop');
});

app.get('/battery', function(req, res) {
	var battery = drone.status.battery;
	res.send(battery);
    });

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
    });
