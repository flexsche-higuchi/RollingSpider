var express = require('express');
var Drone = require('rolling-spider');
var app = express();
var UUID = '';
if (process.env.UUID) {
    console.log('UUID:', process.env.UUID);
    var UUID = process.env.UUID;
} else {
    console.log('You shoud set UUID');
    process.exit();
}

var ACTIVE = true;
var STEPS = 5;

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

/* 離陸 */
app.get('/takeoff', function (req, res) {
	drone.takeOff(
        function(){
            res.send("takeoff");
            setInterval(
                function(){
		    if (!ACTIVE) {
			return;
		    }
                    switch(command){
                    case 'forward':
                        drone.forward({ steps: STEPS });
			cooldown();
                        break;
                    case 'backward':
                        drone.backward({ steps: STEPS });
			cooldown();
                        break;
                    case 'tleft':   
                        drone.turnLeft({ steps: STEPS });
			cooldown();
                        break;
                    case 'tright':   
                        drone.turnRight({ steps: STEPS });
			cooldown();
                        break;
                    case 'up':
                        drone.up({ steps: STEPS * 2.5 });
                        cooldown();
                        break;
                    case 'down':
                        drone.down({ steps: STEPS * 2.5 });
                        cooldown();
                        break;
                    }
                },
                STEPS * 12
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

/* 前転 */
app.get('/frontFlip', function(req, res) {
	drone.frontFlip();
	res.send('Front Flip');
    });

/* 後転 */
app.get('/backFlip', function(req, res) {
	drone.backFlip();
	res.send('Back Flip');
    });

/* 上昇 */
app.get('/up', function(req, res) {
    command = 'up';
	res.send('Up');
    });

/* 下降 */
app.get('/down', function(req, res) {
    command = 'down';
	res.send('Down');
});

app.get('/stop', function(req, res){
    command = '';
    res.send('Stop');
});

/* 状態 */
app.get('/status', function(req, res) {
        res.send(drone.status);
    });

app.listen(3000, function () {
    console.log('app listening on port 3000!');
    });

drone.connect(function() {
    drone.setup(function(){
        console.log('Configured for Rolling Spider! ', drone.name);
        drone.flatTrim();
        drone.startPing();
        drone.flatTrim();
    });
});
