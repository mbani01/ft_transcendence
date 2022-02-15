"use strict";
// import { * } from "node_modules/socket.io-client/dist/socket.io.js";
const socket = io("http://10.12.9.10:3000");
let GameId;
let isHost;
let isDefaultGame;
let ball_position;
// const socket = io("https://server-domain.com");
socket.on("connect", () => {
    console.log("Connnnected");
    // console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});
socket.emit('joinDefaultGame', { wsap: '1' });
socket.on("syncRound", (obj) => {
    // console.log("hello", obj);
    player1_score_obj.setText('' + obj.player1_score);
    player2_score_obj.setText('' + obj.player2_score);
});
socket.on("GameOver", (obj) => {
    if (obj.hasOwnProperty('disconnectedPlayer')) {
        console.log("disco");
        ball.setVisible(false);
        game.scene.pause(scene);
        scene.add.text(game.canvas.width / 4, game.canvas.height / 3, 'other Player Disconnected', { fontSize: '100px', fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
    }
    else {
        console.log("win");
        ball.setVisible(false);
        game.scene.pause(scene);
        scene.add.text(game.canvas.width / 4, game.canvas.height / 3, 'game over', { fontSize: '100px', fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
    }
});
socket.on("gameStarted", (obj) => {
    game = new Phaser.Game(config);
    GameId = obj.GameId;
    isHost = obj.isHost;
    ball_position = obj.ball;
    console.log("joined");
    isDefaultGame = obj.isDefaultGame;
    // console.log(obj);
});
socket.on('sync', (obj) => {
    // console.log(obj);
    if (obj.hasOwnProperty('down')) {
        // console.log(P)
        other_player.body.setVelocityY(+PLAYER_SPEED);
    }
    else if (obj.hasOwnProperty('up')) {
        other_player.body.setVelocityY(-PLAYER_SPEED);
    }
});
socket.on('syncBall', (obj) => {
    if (ball.x !== obj.ball.x || ball.y !== obj.ball.y) {
        ball.setPosition(obj.ball.x, obj.ball.y);
    }
});
socket.on('syncPowerUp', (obj) => {
    powerUpBall.setVisible(obj.isVisible);
    if (obj.hasOwnProperty('collided')) {
        if (obj.collided == 1) {
            player1.setDisplaySize(player1.displayWidth, player1.displayHeight * 1.5);
            // scene.time.delayedCall(10000, showPowerUp, [], player1);
            scene.time.delayedCall(5000, resetPlayerSize, [], player1);
        }
        else {
            player2.setDisplaySize(player2.displayWidth, player2.displayHeight * 1.5);
            // scene.time.delayedCall(10000, showPowerUp, [], player2);
            scene.time.delayedCall(5000, resetPlayerSize, [], player2);
        }
    }
    else if (powerUpBall.x !== obj.powerUpBall.x || powerUpBall.y !== obj.powerUpBall.y) {
        // powerUpBall.setVisible(true);
        powerUpBall.setPosition(obj.powerUpBall.x, obj.powerUpBall.y);
    }
});
/*            hello world!          */
var config = {
    type: Phaser.AUTO,
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
        update: update
    }
};
let game;
let scene;
let player1;
let player2;
let ball;
let powerUpBall;
let player1_score_obj;
let player2_score_obj;
let local_player;
let other_player;
let timer_obj;
let player1_score = 0;
let player2_score = 0;
let clock;
let player1_collider;
let player2_collider;
let PLAYER_SPEED = 1000;
let BALL_SPEED = 200;
let BALL_DIAMETER = 50;
let PLAYER_WIDTH = 3;
let PLAYER_HEIGHT = 200;
function preload() {
    this.load.image("bar", "assets/bar.png");
    this.load.image("powerUp", "assets/pokeball.png");
    this.load.image("ball", "assets/whiteBall.png");
    this.load.audio("bip", "assets/bip.wav");
}
let keyA;
let keyS;
function start_game() {
    ball.setPosition(game.canvas.width / 2, game.canvas.height / 2);
    ball.body.onWorldBounds = true;
    if (isHost) {
        ball.body.velocity.setTo(ball_position.x, ball_position.y);
        ball.setBounce(1);
        this.physics.add.collider(ball, player1, HandleHit, null, player1);
        this.physics.add.collider(ball, player2, HandleHit, null, player2);
    }
    player1_score_obj.setFontSize(100);
    player2_score_obj.setFontSize(100);
}
function onHidden() {
    // socket.emit('focusLose', { GameId: GameId, isHost: isHost, focus: false });
    console.log("hidden");
}
function onFocus() {
    socket.emit('focusLose', { GameId: GameId, isHost: isHost, focus: true });
}
socket.on('focusLose', (obj) => {
    console.log(obj, game.hasFocus);
    if (obj.focus == false)
        game.scene.pause(scene);
    else if (game.hasFocus == true)
        game.scene.resume(scene);
});
function create() {
    this.sound.pauseOnBlur = false;
    // game.events.addListener('blur', onHidden);
    // game.events.addListener('focus', onFocus);
    // game.events.off('hidden', game.events., game);
    scene = this;
    clock = this.time;
    let line = this.add.line(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 0, 0, 0, this.sys.canvas.height, 0xffffff).setLineWidth(5);
    let mid_circle = this.add.circle(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 100, 0).setStrokeStyle(10, 0xffffff);
    let left_circle = this.add.circle(-700 / 2, this.sys.canvas.height / 2, 700, 0).setStrokeStyle(10, 0xffffff);
    let right_circle = this.add.circle(this.sys.canvas.width + 700 / 2, this.sys.canvas.height / 2, 700, 0).setStrokeStyle(10, 0xffffff);
    player1 = this.physics.add.sprite(this.sys.canvas.width * 1 / 100, this.sys.canvas.height / 2, "bar");
    player1.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
    player2 = this.physics.add.sprite(this.sys.canvas.width * 99 / 100, this.sys.canvas.height / 2, "bar");
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
    if (isHost) {
        ball.setCollideWorldBounds(true);
        if (!isDefaultGame) {
            powerUpBall.setCollideWorldBounds(true);
        }
    }
    ball.body.setAllowGravity(false);
    if (!isDefaultGame) {
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
    ball.body.world.on('worldbounds', function (body, up, down, left, right) {
        if (body.gameObject === this && isHost) {
            scene.physics.world.removeCollider(player1_collider);
            scene.physics.world.removeCollider(player2_collider);
            ball.setAcceleration(0);
            if (right) {
                scene.sound.play("bip");
                player1_score_obj.setText('' + ++player1_score);
                socket.emit('syncRound', { GameId: GameId, player1_score: player1_score, player2_score: player2_score });
                ball.body.velocity.setTo(0, 0);
                ball.setPosition(scene.sys.canvas.width / 2, scene.sys.canvas.height / 2);
                clock.delayedCall(1000, start_game, [], scene);
            }
            else if (left) {
                scene.sound.play("bip");
                player2_score_obj.setText('' + ++player2_score);
                socket.emit('syncRound', { GameId: GameId, player1_score: player1_score, player2_score: player2_score });
                ball.body.velocity.setTo(0, 0);
                ball.setPosition(scene.sys.canvas.width / 2, scene.sys.canvas.height / 2);
                clock.delayedCall(1000, start_game, [], scene);
            }
            else if (down || up) {
                scene.sound.play("bip");
            }
        }
    }, ball);
    player1_score_obj = this.add.text(this.sys.canvas.width / 4, 20, '' + player1_score, { fontSize: '0px', fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
    player2_score_obj = this.add.text(this.sys.canvas.width / 4 * 3, 20, '' + player2_score, { fontSize: '0px', fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
    // timer_obj = this.add.text(this.sys.canvas.width / 2 - 32 / 2, 20, '' + player2_score, {fontSize: '50px', fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
    this.time.delayedCall(1000, start_game, [], this);
    if (isHost) {
        local_player = player1;
        other_player = player2;
    }
    else {
        local_player = player2;
        other_player = player1;
    }
    if (isHost) {
        this.physics.add.collider(ball, player1, HandleHit, null, player1);
        this.physics.add.collider(ball, player2, HandleHit, null, player2);
        if (!isDefaultGame) {
            this.physics.add.collider(powerUpBall, player1, setPowerUp, null, player1);
            this.physics.add.collider(powerUpBall, player2, setPowerUp, null, player2);
        }
    }
    if (!isDefaultGame)
        this.time.delayedCall(5000, showPowerUp, [], this);
    scene.time.addEvent({
        delay: 500,
        callback: function () {
            let x = ball.body.velocity.x;
            let y = ball.body.velocity.y;
            if (x != 0 && y != 0) {
                // ball.setAcceleration(100);
                // ball.body.setVelocity(x + 1000, y + 1000);
            }
        },
        //args: [],
        loop: true
    });
}
function HandleHit() {
    if (this.y < ball.y) {
        ball.setVelocityY(-10 * (this.y - ball.y));
    }
    else if (this.y > ball.y) {
        ball.setVelocityY(10 * (ball.y - this.y));
        console.log("right");
    }
}
function enablePowerUps() {
    if (isHost)
        powerUpBall.setVelocity(1000);
    powerUpBall.setBounce(1);
}
function resetPlayerSize() {
    this.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
}
function setPowerUp() {
    if (this == player1)
        socket.emit('syncPowerUp', { "GameId": GameId, 'collided': 1 });
    else
        socket.emit('syncPowerUp', { "GameId": GameId, 'collided': 2 });
    this.setDisplaySize(this.displayWidth, this.displayHeight * 1.5);
    powerUpBall.setPosition(-200, -200);
    powerUpBall.setVelocity(0);
    powerUpBall.setVisible(false);
    scene.time.delayedCall(10000, showPowerUp, [], this);
    scene.time.delayedCall(5000, resetPlayerSize, [], this);
}
function showPowerUp() {
    powerUpBall.setRandomPosition(0, 0, game.canvas.width, game.canvas.height);
    powerUpBall.setVisible(true);
    scene.time.delayedCall(3000, enablePowerUps, [], this);
}
function update() {
    let cursors = this.input.keyboard.createCursorKeys();
    // first player movement
    // console.log(ball.x); 
    if (isHost)
        socket.emit('syncBall', { "GameId": GameId, isVisible: false, isHost: isHost, ball: { x: ball.x, y: ball.y } });
    if (isHost && !isDefaultGame) {
        if (powerUpBall.visible)
            socket.emit('syncPowerUp', { "GameId": GameId, isHost: isHost, isVisible: powerUpBall.visible, powerUpBall: { x: powerUpBall.x, y: powerUpBall.y } });
        else if (!powerUpBall.visible) {
            socket.emit('syncPowerUp', { "GameId": GameId, isHost: isHost, isVisible: powerUpBall.visible, powerUpBall: { x: game.canvas.width / 2, y: game.canvas.height / 2 } });
        }
    }
    if (cursors.down.isDown && !cursors.up.isDown) {
        local_player.body.setVelocityY(+PLAYER_SPEED);
        socket.emit('sync', { "GameId": GameId, "down": "1", isHost: isHost });
    }
    else if (cursors.up.isDown && !cursors.down.isDown) {
        local_player.body.setVelocityY(-PLAYER_SPEED);
        socket.emit('sync', { "GameId": GameId, "up": "1", isHost: isHost });
    }
}
