//module.exports.Swarm = require('./lib/swarm');

var express = require('express');
var Drone = require('rolling-spider');
var app = express();

/* for swarm */
var Swarm = require('rolling-spider').Swarm;
var ACTIVE = true;
var STEPS = 5;

/* swarm define */
var swarm = new Swarm({timeout: 10});
// hosoi's drone ["bf718a716b944996908ac86a8f2c2803"]
// higuchi's drone ["8813276e878d42759150dcb9f8457f8b"]
//var swarm = new Swarm("bf718a716b944996908ac86a8f2c2803");
//var swarm = new Swarm(["bf718a716b944996908ac86a8f2c2803","8813276e878d42759150dcb9f8457f8b"]);

/* 一定時間はコマンドを受け付けないようにする */
function cooldown(){
    ACTIVE = false;
    setTimeout(function() {
	    ACTIVE = true;
	}, STEPS * 12);
}

var command = '';

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.send('ready for flight!');
});

/* 離陸 */
app.get('/takeoff', function (req, res) {
    swarm.takeOff(
        function(){
            res.send("takeoff");
            setInterval(
                function(){
		    if (!ACTIVE) {
			return;
		    }
                    switch(command){
                    case 'forward':
                        swarm.forward({ steps: STEPS });
			cooldown();
                        break;
                    case 'backward':
                        swarm.backward({ steps: STEPS });
			cooldown();
                        break;
                    case 'tleft':   
                        swarm.turnLeft({ steps: STEPS });
			cooldown();
                        break;
                    case 'tright':   
                        swarm.turnRight({ steps: STEPS });
			cooldown();
                        break;
                    case 'up':
                        swarm.up({ steps: STEPS * 2.5 });
                        cooldown();
                        break;
                    case 'down':
                        swarm.down({ steps: STEPS * 2.5 });
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
    swarm.land();
    });

/* 緊急着陸 */
app.get('/emergency', function(req, res) {
	res.send('Emergency');
	swarm.emergency();
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
      swarm.frontFlip({ steps: STEPS });
      cooldown();
	res.send('Front Flip');
    });

/* 後転 */
app.get('/backFlip', function(req, res) {
      swarm.backFlip({ steps: STEPS });
      cooldown();
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
/*
app.get('/status', function(req, res) {
        res.send(swarm.status);
    });
*/

app.listen(3000, function () {
    console.log('app listening on port 3000!');
    });

/* start swarm define */
swarm.assemble();
swarm.on('assembled', function () {
  ACTIVE = true;
  console.log('Configured for Rolling Spider! ', swarm.members.length);
    swarm.members.forEach(function(member){
	    console.log(member.name);
	});
});
/* end swarm define */
