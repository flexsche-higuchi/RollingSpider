var express = require('express');
var Drone = require('rolling-spider');
var app = express();
var UUID = '65ba853a26c140579b29e2219bed052f';
var drone = new Drone(UUID);

var ACTIVE = true;
var STEPS = 20;

/* 一定時間はコマンドを受け付けないようにする */
function cooldown(){
    ACTIVE = false;
    setTimeout(function() {
	    ACTIVE = true;
	}, STEPS * 12);
}

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.send('ready for flight!');
});

/* 離陸 */
app.get('/takeoff', function (req, res) {
	res.send("takeoff");
	drone.takeOff();
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
	drone.forward({ steps: STEPS });
	res.send('Forward');
	cooldown();
    });

/* 後進 */
app.get('/backward', function(req, res) {
	res.send('Backward');
	drone.backward({ steps: STEPS });
	cooldown();
    });

/* 左旋回 */
app.get('/turnLeft', function(req, res) {
	res.send('Turn Left');
	drone.turnLeft({ steps: STEPS });
	cooldown();
    });

/* 右旋回 */
app.get('/turnRight', function(req, res) {
	res.send('Turn Right');
	drone.turnRight({ steps: STEPS });
	cooldown();
    });

app.get('/battery', function(req, res) {
	var battery = drone.status.battery;
	res.send(battery);
    });

drone.connect(function() {
	drone.setup(function(){
		console.log('Configured for Rolling Spider! ', drone.name);
		drone.flatTrim();
		drone.startPing();
		drone.flatTrim();
		app.listen(3000, function () {
			console.log('Example app listening on port 3000!');
		    });
	    });
    });

