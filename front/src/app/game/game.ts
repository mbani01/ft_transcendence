
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
		scene.add.text(game.canvas.width / 6.35, game.canvas.height / 2.1, obj.Players[0].username + ' disconnected', {
			fontSize: '30px',
			fontFamily: "'Press Start 2P', cursive"
		});
		scene.add.text(game.canvas.width / 1.7, game.canvas.height / 2.1, obj.Players[1].username + ' won', {
			fontSize: '30px',
			fontFamily: "'Press Start 2P', cursive"
		});
	} else {
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

export function leftTab()
{
	isWatcher = false;
	isPlayer = false;
	socket.removeListener("syncCounter");
	socket.removeListener("syncRound");
	socket.removeListener("sync");
	socket.removeListener("syncBall");
	socket.removeListener("syncPowerUp");
	socket.removeListener("focusLose");
	clearInterval(clientInterval);
	clearInterval(hostInterval);
	// socket.emit(); // emit watcher left tab
	if (isWatcher)
		socket.emit("watcherLeft", { GameId: GameId });
	if (game != undefined)
		game.destroy();
	game = undefined;
}

function emitIfGameActive(event : string, data: any)
{
	if (!gameEnd){
		socket.emit(event, data);
	}
}

export function gameOver(obj: any) {
	clearInterval(hostInterval);
	clearInterval(clientInterval);
	gameEnd = true;
	scene.input.keyboard.clearCaptures();
	if (obj.hasOwnProperty('disconnectedPlayer')) {
		ball.setVisible(false);
		disconnectedPlayer(obj ,obj.disconnectedPlayer.sub == obj.Players[0].sub);
	} else {
		ball.setVisible(false);
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
	setTimeout(leftTab, 1000);
}

export function setSocket(s: MainSocket) {
	socket = s;
}

export function startGame(obj: any) {
	if (game == undefined){
		player1_score = 0;
		player2_score = 0;
		if (obj.hasOwnProperty("score")) {
			player1_score = obj.score.player1;
			player2_score = obj.score.player2;
		}
		game = new Phaser.Game(config);
		gameEnd = false;
	}


	GameId = obj.GameId;
	if (!obj.hasOwnProperty('isWatcher')){
		isHost = obj.isHost;
		ball_position = obj.ball;
		isPlayer = true;
	}
	else if (isPlayer != true)
		isWatcher = obj.isWatcher;
	isDefaultGame = obj.isDefaultGame;
	imagePlayer1 = obj.imageUser1;
	imagePlayer2 = obj.imageUser2;
	nameUser1 = obj.nameUser1;
	nameUser2 = obj.nameUser2;
}
export function socketListening () {

  socket.on("connect", () => {
  });

	socket.on("syncCounter", (obj: any) => {
		if (isWatcher && game != undefined) {
			if (!obj.hasOwnProperty('disable')) {
				if (obj.isHost) {
					hostText.setFontSize(50);
					hostText.setText('' + obj.counter);
				} else {
					clientText.setFontSize(50);
					clientText.setText('' + obj.counter);
				}
			} else {
				if (obj.isHost) {
					hostText.setText('');
				} else {
					clientText.setText('');
				}
			}
		}
	});

  // emitIfGameActive('joinDefaultGame', {wsap: '1'});


  socket.on("syncRound", (obj: any) => {
	if (game != undefined) {
		player1_score_obj.setText('' + obj.player1_score);
		player2_score_obj.setText('' + obj.player2_score);
	}
  });

  socket.on('sync', (obj: any) => {

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
		player1.setDisplaySize(player1.displayWidth, PLAYER_HEIGHT * 1.5);
		// scene.time.delayedCall(10000, showPowerUp, [], player1);
		scene.time.delayedCall(5000, resetPlayerSize, [], player1);
	  } else {
		player2.setDisplaySize(player2.displayWidth, PLAYER_HEIGHT * 1.5);
		// scene.time.delayedCall(10000, showPowerUp, [], player2);
		scene.time.delayedCall(5000, resetPlayerSize, [], player2);
	  }
	} else if (powerUpBall.x !== obj.powerUpBall.x || powerUpBall.y !== obj.powerUpBall.y) {
	  // powerUpBall.setVisible(true);
	  powerUpBall.setPosition(obj.powerUpBall.x, obj.powerUpBall.y);
	}
  });

	socket.on('focusLose', (obj: any) => {
		if (isPlayer){
			if (obj.focus == false) {
				game.scene.pause(scene);
				if (obj.isHost == true && gameEnd == false) {
					clearInterval(hostInterval);
					hostCounter = 30;
					hostInterval = setInterval(() => {
						game.scene.pause(scene);
						hostText.setText('' + hostCounter);
						hostText.setFontSize(50);
						if (hostCounter <= 0){
							hostText.setText('' + 0);
							clearInterval(hostInterval);
							clearInterval(clientInterval);
						}
						hostCounter--;
					}, 1000);
				} else if (gameEnd == false) {
					isClientPaused = true;
					clearInterval(clientInterval);
					clientCounter = 30;
					clientInterval = setInterval(() => {
						game.scene.pause(scene);
						clientText.setText('' + clientCounter);
						clientText.setFontSize(50);
						if (clientCounter <= 0) {
							clientText.setText('' + 0);
							clearInterval(hostInterval);
							clearInterval(clientInterval);
						}
						clientCounter--;
					}, 1000);
				}
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
						isClientPaused = false;
						// clientInterval = setInterval(() => {
							// 	clientText.setText('' + clientCounter--);
							clientCounter = 30;
							clientText.setFontSize(0);
							// 	if (clientCounter == 0)
							clearInterval(clientInterval);
							// }, 1000);
						}
					}
					if (obj.focus == true && !document.hidden && !gameEnd && !isClientPaused) {
						game.scene.resume(scene);
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
let player1_score : number = 0;
let player2_score : number = 0;
let clock : Phaser.Time.Clock;
let player1_collider : Phaser.Physics.Arcade.Collider ;
let player2_collider : Phaser.Physics.Arcade.Collider ;
let isClientPaused : boolean = false;
let PLAYER_SPEED: number = 20;
let BALL_DIAMETER : number = 50;
let PLAYER_WIDTH : number = 6;
let PLAYER_IMAGE_SIZE = 150;
let PLAYER_HEIGHT : number = 200;
let hostInterval : any;
let hostCounter : number = 30;
let hostText : any;
let clientInterval : any;
let clientCounter : number = 30;
let clientText : any;
let ballVelocity : number[] = [600, -600];
let powerUpVelocity : number[] = [1000, -1000];
let imagePlayer1 : string;
let imagePlayer2 : string;
let nameUser1 : string;
let nameUser2 : string;

function preload (this: Phaser.Scene) : void
{
	this.load.image("bar", "assets/bar.png");
	this.load.image("powerUp", "assets/pokeball.png");
	this.load.image("ball", "assets/whiteBall.png");
	this.load.image("imagePlayer1", imagePlayer1);
	this.load.image("imagePlayer2", imagePlayer2);
	this.load.audio("bip", "assets/bip.wav");
}

let keyA : Phaser.Input.Keyboard.Key;
let keyS : Phaser.Input.Keyboard.Key;

function start_game(this: Phaser.Scene) : void
{
	if (!isWatcher)
		ball.setPosition(game.canvas.width / 2, game.canvas.height / 2);
	(ball.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;
	if (isHost){
		ball.body.velocity.setTo(ballVelocity[Math.floor(Math.random() * 2)], ballVelocity[Math.floor(Math.random() * 2)]);
		ball.setBounce(1);
		this.physics.add.collider(ball, player1, HandleHit, undefined, player1);
		this.physics.add.collider(ball, player2, HandleHit, undefined, player2);
	}
	player1_score_obj.setFontSize(100);
	player2_score_obj.setFontSize(100);
}

function onHidden() : void
{
	if (gameEnd == false && isPlayer && game != undefined){
		game.scene.pause(scene);
		emitIfGameActive('focusLose', { GameId: GameId, isHost: isHost, focus: false });
		if (isHost == true) {
			clearInterval(hostInterval);
			hostCounter = 30;
			hostInterval = setInterval(() => {
				emitIfGameActive("syncCounter", { GameId: GameId, isHost: isHost, data: "hello", counter: hostCounter });
				game.scene.pause(scene);
				hostText.setText('' + hostCounter);
				hostText.setFontSize(50);
				if (hostCounter <= 0) {
					hostText.setText('' + 0);
					emitIfGameActive("PlayerTimeout", { GameId: GameId });
					hostCounter = 30;
					clearInterval(hostInterval);
					clearInterval(clientInterval);
				}
				hostCounter--;
			}, 1000)
		} else {
			clearInterval(clientInterval);
			clientCounter = 30;
			clientInterval = setInterval(() => {
				emitIfGameActive("syncCounter", { GameId: GameId, isHost: isHost, data: "hello", counter: clientCounter });
				game.scene.pause(scene);
				clientText.setText('' + clientCounter);
				clientText.setFontSize(50);
				if (clientCounter <= 0) {
					clientText.setText('' + 0);
					emitIfGameActive("PlayerTimeout", { GameId: GameId });
					clientCounter = 30;
					clearInterval(hostInterval);
					clearInterval(clientInterval);
				}
				clientCounter--;
			}, 1000)
		}
	}
}

function onFocus() : void
{
	if(isPlayer && !gameEnd){
		emitIfGameActive('focusLose', { GameId: GameId, isHost: isHost, focus: true });
		if (isHost == true) {
			emitIfGameActive("syncCounter", { GameId: GameId, isHost: isHost, disable: true });
			// hostInterval = setInterval(() => {
				// hostText.setText('' + hostCounter--);
				hostCounter = 30;
				hostText.setFontSize(0);
				// 	if (hostCounter == 0)
				clearInterval(hostInterval);
				// }, 1000);
		} else {
			emitIfGameActive("syncCounter", { GameId: GameId, isHost: isHost, disable: true });
				// clientInterval = setInterval(() => {
					// 	clientText.setText('' + clientCounter--);
			clientCounter = 30;
			clientText.setFontSize(0);
			// 	if (clientCounter == 0)
			clearInterval(clientInterval);
			// }, 1000);
		}
		if (!isClientPaused)
			game.scene.resume(scene);
	}
}



function create (this: Phaser.Scene) : void
{
	scene = this;
	// this.physics.add.sprite(PLAYER_IMAGE_SIZE / 2, PLAYER_IMAGE_SIZE / 2, "imagePlayer1").setDisplaySize(PLAYER_IMAGE_SIZE, PLAYER_IMAGE_SIZE).body.setAllowGravity(false);
	// this.physics.add.sprite(this.sys.canvas.width - (PLAYER_IMAGE_SIZE / 2), PLAYER_IMAGE_SIZE / 2, "imagePlayer2").setDisplaySize(PLAYER_IMAGE_SIZE, PLAYER_IMAGE_SIZE).body.setAllowGravity(false);
	this.add.text(PLAYER_IMAGE_SIZE + 20, 20, nameUser1, {fontSize: '20px', fontFamily: "'Press Start 2P', cursive" });
	this.add.text(this.sys.canvas.width - PLAYER_IMAGE_SIZE  - 20, 20, nameUser2, {fontSize: '20px', fontFamily: "'Press Start 2P', cursive" }).setOrigin(1, 0);
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
				if (!isWatcher){
					ball.setPosition(scene.sys.canvas.width / 2, scene.sys.canvas.height / 2);
					clock.delayedCall(1000, start_game, [], scene);
				}
			}
			else if (left)
			{
				// scene.sound.play("bip");
				player2_score_obj.setText('' + ++player2_score);
				emitIfGameActive('syncRound', { GameId: GameId, player1_score: player1_score, player2_score: player2_score});
				ball.body.velocity.setTo(0, 0);
				if (!isWatcher){
					ball.setPosition(scene.sys.canvas.width / 2, scene.sys.canvas.height / 2);
					clock.delayedCall(1000, start_game, [], scene);
				}
			}
			else if (down || up)
			{
			// scene.sound.play("bip");
			}
		}
	}, ball);

	player1_score_obj = this.add.text(this.sys.canvas.width / 6 * 2, 20, '' + player1_score, {fontSize: '0px', fontFamily: "'Press Start 2P', cursive" });
	player2_score_obj = this.add.text(this.sys.canvas.width / 6 * 4 - 75, 20, '' + player2_score, {fontSize: '0px', fontFamily: "'Press Start 2P', cursive" });
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
	}
}

function enablePowerUps() : void
{
  if (isHost)
	powerUpBall.setVelocity(powerUpVelocity[Math.floor(Math.random() * 2)], powerUpVelocity[Math.floor(Math.random() * 2)]);
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
  this.setDisplaySize(this.displayWidth, PLAYER_HEIGHT * 1.5);
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
		local_player.setPosition(local_player.x, local_player.y + PLAYER_SPEED);
		emitIfGameActive('sync', {"GameId":GameId, player: {x: local_player.x, y: local_player.y}, isHost: isHost});

	} else if (cursors.up.isDown && !cursors.down.isDown && !isWatcher) {
		local_player.setPosition(local_player.x, local_player.y - PLAYER_SPEED)
		emitIfGameActive('sync', {"GameId":GameId, player: {x: local_player.x, y: local_player.y}, isHost: isHost});
	}
}

/* 400 commit */
