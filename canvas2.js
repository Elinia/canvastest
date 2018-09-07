
var canvasElement = document.getElementById('canvasElement');
//var canvasElement = document.createElement('canvas');
//canvasElement.id = 'canvasElement';
//canvasElement.width = '1000px';
//canvasElement.height = '500px';
var context = canvasElement.getContext('2d');
var backgroundWidth = 300;
var backgroundHeight = 220;
function Ball(parameters) {
	/**
	 * state:
	 * 1: moveRight or moveDown
	 * 2: squeezeRight or squeezeDown
	 * 3: moveLeft or moveUp
	 * 4: squeezeLeft or squeezeUp
	 */
	var defaultValues = {
		radius: 30, /* 球体半径 */
		k: 100, /* 弹性系数 */
		x: {
			originalSpeed: 1, /* 初始速度 */
			squeezed: 0, /* 挤压深度 */
			scale: 0, /* 挤压程度 */
			state: 1 /* 状态 */
		},
		y: {
			originalSpeed: 0.5,
			squeezed: 0,
			scale: 0,
			state: 1
		},
	};
	var values = $.extend(defaultValues, parameters);
	var init = function() {
		values.weight = values.radius * values.radius * values.radius;
		values.x.bgMin = values.radius;
		values.x.bgMax = backgroundWidth - values.radius;
		values.y.bgMin = values.radius;
		values.y.bgMax = backgroundHeight - values.radius;
		values.y.bgLength = backgroundHeight;
		values.x.speed = values.x.originalSpeed;
		values.y.speed = values.y.originalSpeed;
		values.x.position = values.radius;
		values.y.position = values.radius;
	};
	this.drawBl = function() {
		var g = context.createRadialGradient(0, 0, 0, 0, 0, values.radius);
		g.addColorStop(0,'#0FF');
		g.addColorStop(1,'#00F');
		context.beginPath();
		scaleBall();
		context.arc(0, 0, values.radius, 0, Math.PI * 2, true);
		
		context.closePath();
		context.fillStyle = g;
		context.fill();
		updateState('x');
		updateState('y');
		context.restore();
		context.save();
	};
	var scaleBall = function() {
		switch (values.x.state) {
		case 1:
			context.translate(values.x.position, 0);
			break;
		case 2:
			context.scale(values.x.scale, 1);
			context.translate(values.x.position/values.x.scale, 0);
			break;
		case 3:
			context.translate(values.x.position, 0);
			break;
		case 4:
			context.scale(values.x.scale, 1);
			context.translate(values.radius, 0);
			break;
		}
		switch (values.y.state) {
		case 1:
			context.translate(0, values.y.position);
			break;
		case 2:
			context.scale(1, values.y.scale);
			context.translate(0, values.y.position/values.y.scale);
			break;
		case 3:
			context.translate(0, values.y.position);
			break;
		case 4:
			context.scale(1, values.y.scale);
			context.translate(0, values.radius);
			break;
		}
	};
	var updateState = function(direction) {
		var newBall;
		switch (direction) {
		case 'x':
			newBall = values.x;
			break;
		case 'y':
			newBall = values.y;
			break;
		}
		switch (newBall.state) {
		case 1:
			newBall.position += newBall.speed;
			if (newBall.position >= newBall.bgMax) {
				newBall.state = 2;
				newBall.position = newBall.bgMax;
				newBall.speed = newBall.originalSpeed;
				newBall.scale = 1;
			}
			break;
		case 2:
			newBall = force(newBall);
			if (newBall.scale >= 1) {
				newBall.state = 3;
				newBall.position = newBall.bgMax;
				newBall.speed = -newBall.originalSpeed;
				newBall.scale = 1;
				newBall.squeezed = 0;
			}
			break;
		case 3:
			newBall.position += newBall.speed;
			if (newBall.position <= newBall.bgMin) {
				newBall.state = 4;
				newBall.position = newBall.bgMin;
				newBall.speed = -newBall.originalSpeed;
				newBall.scale = 1;
			}
			break;
		case 4:
			newBall = force(newBall);
			if (newBall.scale >= 1) {
				newBall.state = 1;
				newBall.position = newBall.bgMin;
				newBall.speed = newBall.originalSpeed;
				newBall.scale = 1;
				newBall.squeezed = 0;
			}
			break;
		}
		switch (direction) {
		case 'x':
			values.x = newBall;
			break;
		case 'y':
			values.y = newBall;
			break;
		}
	};
	var force = function(theBall) {
		switch (theBall.state) {
		case 2:
			theBall.squeezed += theBall.speed;
			theBall.acceleration = -(theBall.squeezed * values.k / values.weight);
			theBall.position = theBall.bgMax + theBall.squeezed / 2;
			break;
		case 4:
			theBall.squeezed -= theBall.speed;
			theBall.acceleration = theBall.squeezed * values.k / values.weight;
			theBall.position = values.bgMin - theBall.squeezed / 2;
			break;
		}
		theBall.scale = 1 - theBall.squeezed / (2 * values.radius);
		theBall.speed += theBall.acceleration;
		return theBall;
	};
	init.call(this);
}
var balls = [];
(function() {
	knockApp();
})();
function knockApp() {
	var r = 10;
	for (var i = 0; i < 20; ++i) {
		balls.push(new Ball({
			radius: r
		}));
		r += 2;
	}
	var interval = setInterval(draw, 1);
}
function draw() {
	drawBg();
	for (var p in balls) {
		balls[p].drawBl();
	}
}
function drawBg() {
	context.fillStyle = '#EEE';
	context.restore();
	context.save();
	context.fillRect(0, 0, backgroundWidth, backgroundHeight);
	context.clearRect(backgroundWidth, 0, 1440, 900);
	context.clearRect(0, backgroundHeight, 1440, 900);
}