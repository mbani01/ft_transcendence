
// import { * } from "node_modules/socket.io-client/dist/socket.io.js";
// import {io} from "socket.io-client";
import Phaser from 'phaser';

import {MainSocket} from "../socket/MainSocket";
import {Subject} from "rxjs";

// import * from '@azerion/phaser-web-workers/build/phaser-web-workers';
let socket: MainSocket;
let GameId : number;
let isHost: boolean;
let isDefaultGame : boolean;
let ball_position : {x: number, y: number};
let isWatcher : boolean = false;
let isPlayer : boolean = false;
let gameEnd : boolean = false;
let cursors : Phaser.Types.Input.Keyboard.CursorKeys;
export const endGame = new Subject<void>();


function disconnectedPlayer(obj: any, isHostDisconnected: boolean)
{
	if (isHostDisconnected) {
		console.log("host Disco", obj);
		scene.add.text(game.canvas.width / 6.35, game.canvas.height / 2.1, obj.Players[0].username + ' disconnected', {
			fontSize: '30px',
			fontFamily: "'Press Start 2P', cursive"
		});
		scene.add.text(game.canvas.width / 1.7, game.canvas.height / 2.1, obj.Players[1].username + ' won', {
			fontSize: '30px',
			fontFamily: "'Press Start 2P', cursive"
		});
	} else {
		console.log("not host Disco", obj);
		scene.add.text(game.canvas.width / 1.82, game.canvas.height / 2.1, obj.Players[1].username +' disconnected', {
			fontSize: '30px',
			fontFamily: "'Press Start 2P', cursive"
		});
		scene.add.text(game.canvas.width / 4.7, game.canvas.height / 2.1, obj.Players[0].username + ' won', {
			fontSize: '30px',
			fontFamily: "'Press Start 2P', cursive"
		});
	}
}

function emitIfGameActive(event : string, data: any)
{
	if (!gameEnd){
		socket.emit(event, data);
		console.log("emited", gameEnd);
	}
}

export function gameOver(obj: any) {
	clearInterval(hostInterval);
	clearInterval(clientInterval);
	gameEnd = true;
	let button = scene.add.text(50, 50, "Go back")
	.setPadding(10)
	.setFontSize(40)
	.setStyle({ backgroundColor: '#8b3cd5' })
	.setInteractive({ useHandCursor: true })
	.on('pointerdown', () => endGame.next())
	.on('pointerover', () => button.setStyle({ fill: '#f39c12' }))
	.on('pointerout', () => button.setStyle({ fill: '#FFF' }));
	if (obj.hasOwnProperty('disconnectedPlayer')) {
		ball.setVisible(false);
		game.scene.pause(scene);
		disconnectedPlayer(obj ,obj.disconnectedPlayer.sub == obj.Players[0].sub);
	} else {
		console.log("win", obj);
		ball.setVisible(false);
		game.scene.pause(scene);
		if (obj.Winner.sub != obj.Players[0].sub) {
			scene.add.text(game.canvas.width / 5.5, game.canvas.height / 2.1, obj.Players[0].username + ' lost', {
				fontSize: '30px',
				fontFamily: "'Press Start 2P', cursive"
			});
			scene.add.text(game.canvas.width / 1.7, game.canvas.height / 2.1, obj.Players[1].username + ' won', {
				fontSize: '30px',
				fontFamily: "'Press Start 2P', cursive"
			});
		} else {
			scene.add.text(game.canvas.width / 1.8, game.canvas.height / 2.1, obj.Players[1].username + ' lost', {
				fontSize: '30px',
				fontFamily: "'Press Start 2P', cursive"
			});
			scene.add.text(game.canvas.width / 5.5, game.canvas.height / 2.1, obj.Players[0].username + ' won', {
				fontSize: '30px	',
				fontFamily: "'Press Start 2P', cursive"
			});
		}
	}
	game = undefined;
}

export function setSocket(s: MainSocket) {
	socket = s;
}

export function startGame(obj: any) {
	console.log(obj, game);
	if (game == undefined){
		game = new Phaser.Game(config);
		gameEnd = false;
		player1_score = 0;
		player2_score = 0;
	}


	GameId = obj.GameId;
	if (!obj.hasOwnProperty('isWatcher')){
		isHost = obj.isHost;
		ball_position = obj.ball;
		isPlayer = true;
	}
	else if (isPlayer != true)
		isWatcher = obj.isWatcher;
	console.log("joined");
	isDefaultGame = obj.isDefaultGame;
	// console.log(obj);

}
export function socketListening () {
  console.log("Listening Socket");

  socket.on("connect", () => {
	console.log("Connnnected");
	// console.log(socket.id); // x8WIv7-mJelg7on_ALbx
  });

  // emitIfGameActive('joinDefaultGame', {wsap: '1'});


  socket.on("syncRound", (obj: any) => {
	// console.log("hello", obj);
	player1_score_obj.setText('' + obj.player1_score);
	player2_score_obj.setText('' + obj.player2_score);

  });

  socket.on('sync', (obj: any) => {
	// console.log(obj);
	// if (obj.hasOwnProperty('down')) {
	//   // console.log(P)
	//   other_player.body.setVelocityY(+PLAYER_SPEED);
	// } else if (obj.hasOwnProperty('up')) {
	//   other_player.body.setVelocityY(-PLAYER_SPEED);
	// }

	if (isPlayer)
		other_player.setPosition(obj.player.x, obj.player.y);
	else if (isWatcher)
	{
		if (obj.isHost) {
			player1.setPosition(obj.player.x, obj.player.y);
		} else {
			player2.setPosition(obj.player.x, obj.player.y);
		}
	}
  });

  socket.on('syncBall', (obj: any) => {
	if (ball.x !== obj.ball.x || ball.y !== obj.ball.y) {
	  ball.setPosition(obj.ball.x, obj.ball.y);
	}
  });

  socket.on('syncPowerUp', (obj: any) => {
	powerUpBall.setVisible(obj.isVisible);
	if (obj.hasOwnProperty('collided')) {
	  if (obj.collided == 1) {
		player1.setDisplaySize(player1.displayWidth, player1.displayHeight * 1.5);
		// scene.time.delayedCall(10000, showPowerUp, [], player1);
		scene.time.delayedCall(5000, resetPlayerSize, [], player1);
	  } else {
		player2.setDisplaySize(player2.displayWidth, player2.displayHeight * 1.5);
		// scene.time.delayedCall(10000, showPowerUp, [], player2);
		scene.time.delayedCall(5000, resetPlayerSize, [], player2);
	  }
	} else if (powerUpBall.x !== obj.powerUpBall.x || powerUpBall.y !== obj.powerUpBall.y) {
	  // powerUpBall.setVisible(true);
	  powerUpBall.setPosition(obj.powerUpBall.x, obj.powerUpBall.y);
	}
  });

	socket.on('focusLose', (obj: any) => {
		console.log(obj, game.hasFocus);
		if (obj.focus == false) {
			game.scene.pause(scene);
			if (obj.isHost == true && gameEnd == false) {
				clearInterval(hostInterval);
				hostCounter = 30;
				hostInterval = setInterval(() => {
					game.scene.pause(scene);
					hostText.setText('' + hostCounter);
					hostText.setFontSize(50);
					if (hostCounter <= 0)
					clearInterval(hostInterval);
					hostCounter--;
				}, 1000);
			} else if (gameEnd == false) {
				clearInterval(clientInterval);
				clientCounter = 30;
				clientInterval = setInterval(() => {
					game.scene.pause(scene);
					clientText.setText('' + clientCounter);
					clientText.setFontSize(50);
					if (clientCounter <= 0)
						clearInterval(clientInterval);
					clientCounter--;
				}, 1000);
			}
		}
		else if (!document.hidden && !gameEnd) {
			game.scene.resume(scene);
		}
		if (obj.focus == true) {
			if (obj.isHost == true) {
				// hostInterval = setInterval(() => {
				// hostText.setText('' + hostCounter--);
					hostCounter = 30;
					hostText.setFontSize(0);
				// 	if (hostCounter == 0)
					clearInterval(hostInterval);
				// }, 1000);

			} else {
				// clientInterval = setInterval(() => {
				// 	clientText.setText('' + clientCounter--);
					clientCounter = 30;
					clientText.setFontSize(0);
				// 	if (clientCounter == 0)
					clearInterval(clientInterval);
				// }, 1000);
			}
		}
	});
}
/*            hello world!          */

var config : Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  // init: function (this : Phaser.Scene){
  //     this.game.plugins.start(PhaserWebWorkers.Plugin);
  // },
  scale: {
	mode: 3,
	parent: 'phaser',
	autoCenter: 1,
	width: 2400,
	height: 1800
  },
  physics: {
	default: 'arcade',
	arcade: {
	  gravity: { y: 300 },
	  debug: false
	}
  },
  scene: {
	preload: preload,
	create: create,
	update: update,
  },
};

let game : any;
let scene : Phaser.Scene;
let player1: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
let player2: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
let ball: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
let powerUpBall: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
let player1_score_obj : Phaser.GameObjects.Text;
let player2_score_obj : Phaser.GameObjects.Text;
let local_player : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
let other_player : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
let timer_obj : Phaser.GameObjects.Text;
let player1_score : number = 0;
let player2_score : number = 0;
let clock : Phaser.Time.Clock;
let player1_collider : Phaser.Physics.Arcade.Collider ;
let player2_collider : Phaser.Physics.Arcade.Collider ;

let PLAYER_SPEED: number = 20;
let BALL_SPEED: number = 200;
let BALL_DIAMETER : number = 50;
let PLAYER_WIDTH : number = 6;
let PLAYER_HEIGHT : number = 200;
let hostInterval : any;
let hostCounter : number = 30;
let hostText : any;
let clientInterval : any;
let clientCounter : number = 30;
let clientText : any;

function preload (this: Phaser.Scene) : void
{

	this.load.image("bar", "assets/bar.png");
	this.load.image("powerUp", "assets/pokeball.png");
	this.load.image("ball", "assets/whiteBall.png");
	this.load.audio("bip", "assets/bip.wav");
}

let keyA : Phaser.Input.Keyboard.Key;
let keyS : Phaser.Input.Keyboard.Key;

function start_game(this: Phaser.Scene) : void
{
	ball.setPosition(game.canvas.width /     2, game.canvas.height / 2);
	(ball.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;
	if (isHost){
		ball.body.velocity.setTo(ball_position.x, ball_position.y);
		ball.setBounce(1);
		this.physics.add.collider(ball, player1, HandleHit, undefined, player1);
		this.physics.add.collider(ball, player2, HandleHit, undefined, player2);
	}
	player1_score_obj.setFontSize(100);
	player2_score_obj.setFontSize(100);
}

function onHidden() : void
{
	if (gameEnd == false){
		game.scene.pause(scene);
		if (isPlayer){
			emitIfGameActive('focusLose', { GameId: GameId, isHost: isHost, focus: false });
			if (isHost == true) {
				clearInterval(hostInterval);
				hostCounter = 30;
				hostInterval = setInterval(() => {
					game.scene.pause(scene);
					hostText.setText('' + hostCounter);
					hostText.setFontSize(50);
					if (hostCounter <= 0) {
						// emitIfGameActive("", );
						hostCounter = 30;
						clearInterval(hostInterval);

					}
					hostCounter--;
				}, 1000)
			} else {
				clearInterval(clientInterval);
				clientCounter = 30;
				clientInterval = setInterval(() => {
					game.scene.pause(scene);
					clientText.setText('' + clientCounter);
					clientText.setFontSize(50);
					if (clientCounter <= 0) {
						// emitIfGameActive("", );
						clientCounter = 30;
						clearInterval(clientInterval);
					}
					clientCounter--;
				}, 1000)
			}
		}
	}
	console.log("hidden");
}

function onFocus() : void
{
	if(isPlayer && !gameEnd){
		emitIfGameActive('focusLose', { GameId: GameId, isHost: isHost, focus: true });
		if (isHost == true) {
			// hostInterval = setInterval(() => {
				// hostText.setText('' + hostCounter--);
				hostCounter = 30;
				hostText.setFontSize(0);
				// 	if (hostCounter == 0)
				clearInterval(hostInterval);
				// }, 1000);

			} else {
				// clientInterval = setInterval(() => {
					// 	clientText.setText('' + clientCounter--);
					clientCounter = 30;
					clientText.setFontSize(0);
					// 	if (clientCounter == 0)
					clearInterval(clientInterval);
					// }, 1000);
				}
				game.scene.resume(scene);
			}
		}

		function create (this: Phaser.Scene) : void
		{

			scene = this;
			cursors = this.input.keyboard.createCursorKeys();
			this.sound.pauseOnBlur = false;
			game.events.addListener('blur', onHidden);
			game.events.addListener('focus', onFocus);
			clock = this.time;
			hostText = scene.add.text(scene.sys.canvas.width / 4, 200, '' + hostCounter, {fontSize: '0px', fontFamily: "'Press Start 2P', cursive" });
			clientText = this.add.text(this.sys.canvas.width / 4 * 3, 200, '' + player2_score, {fontSize: '0px', fontFamily: "'Press Start 2P', cursive" });
			let line : Phaser.GameObjects.Line = this.add.line(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 0, 0, 0, this.sys.canvas.height, 0xffffff).setLineWidth(5);
			let mid_circle : Phaser.GameObjects.Arc = this.add.circle(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 100, 0).setStrokeStyle(10, 0xffffff);
			let left_circle : Phaser.GameObjects.Arc = this.add.circle(-700 / 2, this.sys.canvas.height / 2, 700, 0).setStrokeStyle(10, 0xffffff);
			let right_circle : Phaser.GameObjects.Arc = this.add.circle(this.sys.canvas.width + 700 / 2, this.sys.canvas.height / 2, 700, 0).setStrokeStyle(10, 0xffffff);
			player1 = this.physics.add.sprite(this.sys.canvas.width * 3 / 100, this.sys.canvas.height / 2, "bar");
			player1.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
			player2 = this.physics.add.sprite(this.sys.canvas.width * 97 / 100, this.sys.canvas.height / 2, "bar");
			player2.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
			if (!isDefaultGame) {
				powerUpBall = this.physics.add.sprite(this.sys.canvas.width / 2, this.sys.canvas.height / 2, "powerUp");
				powerUpBall.setDisplaySize(50, 50);
				powerUpBall.setVisible(false);
				powerUpBall.setOrigin(0.5, 0.5);
			}
			ball = this.physics.add.sprite(this.sys.canvas.width / 2, this.sys.canvas.height / 2, "ball");
			ball.setDisplaySize(BALL_DIAMETER, BALL_DIAMETER);
			player1.setCollideWorldBounds(true);
			player2.setCollideWorldBounds(true);
			if (isHost){
				ball.setCollideWorldBounds(true);
				if (!isDefaultGame){
					powerUpBall.setCollideWorldBounds(true);
				}
			}
			ball.body.setAllowGravity(false);
			if (!isDefaultGame){
	powerUpBall.body.setAllowGravity(false);
	}
	player1.body.setAllowGravity(false);
	player2.body.setAllowGravity(false);
	player1.body.setImmovable(true);
	player2.body.setImmovable(true);
	player1.setDrag(4000);
	player2.setDrag(4000);
	keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
	keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
	ball.body.world.on('worldbounds', function(this : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, body: Phaser.Physics.Arcade.Body, up: boolean, down: boolean, left: boolean, right: boolean) {
	if (body.gameObject === this && isHost) {
		scene.physics.world.removeCollider(player1_collider);
		scene.physics.world.removeCollider(player2_collider);
		ball.setAcceleration(0);
		if (right)
		{
		// scene.sound.play("bip");
		player1_score_obj.setText('' + ++player1_score);
		emitIfGameActive('syncRound', { GameId: GameId, player1_score: player1_score, player2_score: player2_score});
		ball.body.velocity.setTo(0, 0);
		ball.setPosition(scene.sys.canvas.width / 2, scene.sys.canvas.height / 2);
		clock.delayedCall(1000, start_game, [], scene);
		}
		else if (left)
		{
		// scene.sound.play("bip");
		player2_score_obj.setText('' + ++player2_score);
		emitIfGameActive('syncRound', { GameId: GameId, player1_score: player1_score, player2_score: player2_score});
		ball.body.velocity.setTo(0, 0);
		ball.setPosition(scene.sys.canvas.width / 2, scene.sys.canvas.height / 2);
		clock.delayedCall(1000, start_game, [], scene);
		}
		else if (down || up)
		{
		// scene.sound.play("bip");
		}
	}
	}, ball);

	player1_score_obj = this.add.text(this.sys.canvas.width / 4, 20, '' + player1_score, {fontSize: '0px', fontFamily: "'Press Start 2P', cursive" });
	player2_score_obj = this.add.text(this.sys.canvas.width / 4 * 3, 20, '' + player2_score, {fontSize: '0px', fontFamily: "'Press Start 2P', cursive" });
	// timer_obj = this.add.text(this.sys.canvas.width / 2 - 32 / 2, 20, '' + player2_score, {fontSize: '50px', fontFamily: "'Press Start 2P', cursive" });
	this.time.delayedCall(1000, start_game, [], this);
	if (isHost){
		local_player = player1;
		other_player = player2;
	} else {
		local_player = player2;
		other_player = player1;
	}
	if (isHost){
		this.physics.add.collider(ball, player1, HandleHit, undefined, player1);
		this.physics.add.collider(ball, player2, HandleHit, undefined, player2);
		if (!isDefaultGame){
			this.physics.add.collider(powerUpBall, player1, setPowerUp, undefined, player1);
			this.physics.add.collider(powerUpBall, player2, setPowerUp, undefined, player2);
		}
	}

	if (!isDefaultGame)
	this.time.delayedCall(5000, showPowerUp, [], this);

  socketListening();
}

function HandleHit(this: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody)
{
	if (this.y < ball.y)
	{
	ball.setVelocityY(-10 * (this.y - ball.y));
	}
	else if (this.y > ball.y)
	{
	ball.setVelocityY(10 * (ball.y - this.y));
	console.log("right");
	}
}

function enablePowerUps() : void
{
  if (isHost)
	powerUpBall.setVelocity(1000);
  powerUpBall.setBounce(1);
}

function resetPlayerSize(this: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody)
{
  this.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
}

function setPowerUp(this: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody)
{
  if (this == player1)
	emitIfGameActive('syncPowerUp', {"GameId":GameId, 'collided': 1});
  else
	emitIfGameActive('syncPowerUp', {"GameId":GameId, 'collided': 2});
  this.setDisplaySize(this.displayWidth, this.displayHeight * 1.5);
  powerUpBall.setPosition(-200, -200);
  powerUpBall.setVelocity(0);
  powerUpBall.setVisible(false);
  scene.time.delayedCall(10000, showPowerUp, [], this);
  scene.time.delayedCall(5000, resetPlayerSize, [], this);
}

function showPowerUp(this: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody)
{
  powerUpBall.setRandomPosition(0, 0, game.canvas.width, game.canvas.height);
  powerUpBall.setVisible(true);
  scene.time.delayedCall(3000, enablePowerUps, [], this);
}

function update(this: Phaser.Scene) : void
{

	if (isHost)
		emitIfGameActive('syncBall', {"GameId":GameId, isVisible : false, isHost: isHost, ball: { x: ball.x, y: ball.y }});
	if (isHost && !isDefaultGame){
		if (powerUpBall.visible)
			emitIfGameActive('syncPowerUp', {"GameId":GameId, isHost: isHost, isVisible : powerUpBall.visible, powerUpBall: { x: powerUpBall.x, y: powerUpBall.y }});
		else if (!powerUpBall.visible)
		{
			emitIfGameActive('syncPowerUp', {"GameId":GameId, isHost: isHost, isVisible : powerUpBall.visible, powerUpBall: { x: game.canvas.width / 2, y: game.canvas.height / 2 }});
		}
	}
	if (cursors.down.isDown && !cursors.up.isDown && !isWatcher) {
		console.log("hello world! down")
		local_player.setPosition(local_player.x, local_player.y + PLAYER_SPEED);
		emitIfGameActive('sync', {"GameId":GameId, player: {x: local_player.x, y: local_player.y}, isHost: isHost});

	} else if (cursors.up.isDown && !cursors.down.isDown && !isWatcher) {
		console.log("hello world! up")
		local_player.setPosition(local_player.x, local_player.y - PLAYER_SPEED)
		emitIfGameActive('sync', {"GameId":GameId, player: {x: local_player.x, y: local_player.y}, isHost: isHost});
	}
	scene.input.keyboard.clearCaptures();
}
