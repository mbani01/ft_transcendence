
// import { * } from "node_modules/socket.io-client/dist/socket.io.js";
const socket = io("http://10.12.9.10:3000");
let GameId : number;
let isHost: number;
let ball_position : {x: number, y: number};
// const socket = io("https://server-domain.com");


socket.on("connect", () => {
    console.log("Connnnected");
        // console.log(socket.id); // x8WIv7-mJelg7on_ALbx
  });

socket.emit('joinDefaultGame', { wsap: '1'});


socket.on("syncRound", (obj) => {
    // console.log("hello", obj);
    player1_score_obj.setText('' + obj.player1_score);
    player2_score_obj.setText('' + obj.player2_score);

});

socket.on("GameOver", (obj) => {
    console.log("hello", obj);
    

});

socket.on("gameStarted", (obj : {GameId: number, ball: {x: number, y: number}, isHost: number}) => {
    game = new Phaser.Game(config);
    
    GameId = obj.GameId;
    isHost = obj.isHost;
    ball_position = obj.ball;
    console.log("joined");
    // console.log(obj);
});

socket.on('sync', (obj) => {
    // console.log(obj);
    if (obj.hasOwnProperty('down'))
    {
        // console.log(P)
        other_player.body.setVelocityY(+PLAYER_SPEED);
    }
    else if (obj.hasOwnProperty('up'))
    {
        other_player.body.setVelocityY(-PLAYER_SPEED);
    }
});

socket.on('syncBall', (obj) => {
    if(ball.x !== obj.ball.x || ball.y !== obj.ball.y)
    {
        ball.setPosition(obj.ball.x, obj.ball.y);
    }
});

socket.on('syncPowerUp', (obj) => {
    powerUpBall.setVisible(obj.isVisible);
    if (obj.hasOwnProperty('collided'))
    {
        if (obj.collided == 1)
        {
            player1.setDisplaySize(player1.displayWidth, player1.displayHeight * 1.5);
            // scene.time.delayedCall(10000, showPowerUp, [], player1);
            scene.time.delayedCall(5000, resetPlayerSize, [], player1);
        }
        else
        {
            player2.setDisplaySize(player2.displayWidth, player2.displayHeight * 1.5);
            // scene.time.delayedCall(10000, showPowerUp, [], player2);
            scene.time.delayedCall(5000, resetPlayerSize, [], player2);
        }
    }
    else if(powerUpBall.x !== obj.powerUpBall.x || powerUpBall.y !== obj.powerUpBall.y)
    {
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
        height: 1800,

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

let game : Phaser.Game;
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

let PLAYER_SPEED: number = 1000;
let BALL_SPEED: number = 200;
let BALL_DIAMETER : number = 50;
let PLAYER_WIDTH : number = 3;
let PLAYER_HEIGHT : number = 200;




function preload (this: Phaser.Scene) : void
{
    
    this.load.image("bar", "assets/bar.png");
    this.load.image("powerUp", "assets/pokeball.png");
    this.load.image("ball", "assets/ball.png");
    this.load.audio("bip", "assets/bip.wav");
}

let keyA : Phaser.Input.Keyboard.Key;
let keyS : Phaser.Input.Keyboard.Key;



function start_game(this: Phaser.Scene) : void
{
    ball.setPosition(game.canvas.width /     2, game.canvas.height / 2);
    ball.body.onWorldBounds = true;
    if (isHost){
        ball.body.velocity.setTo(ball_position.x, ball_position.y);
        ball.setBounce(1);
    }
    player1_score_obj.setFontSize(100);
    player2_score_obj.setFontSize(100);
}

function onBlur() : void
{
    socket.emit('focusLose', { GameId: GameId, isHost: isHost, focus: false });
    game.scene.pause(scene);
}

function onFocus() : void
{
    socket.emit('focusLose', { GameId: GameId, isHost: isHost, focus: true });
    game.scene.resume(scene);
}

socket.on('focusLose', (obj) => {
    console.log(obj, game.hasFocus);
    if (obj.focus == false)
        game.scene.pause(scene);
    else if (game.hasFocus == true)
        game.scene.resume(scene);
});

function create (this: Phaser.Scene) : void
{
    this.sound.pauseOnBlur = false;
    // game.events.addListener('blur', onBlur);
    // game.events.addListener('focus', onFocus);
    scene = this;
    clock = this.time;
    let line : Phaser.GameObjects.Line = this.add.line(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 0, 0, 0, this.sys.canvas.height, 0xffffff).setLineWidth(5);
    let mid_circle : Phaser.GameObjects.Arc = this.add.circle(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 100, 0).setStrokeStyle(10, 0xffffff);
    let left_circle : Phaser.GameObjects.Arc = this.add.circle(-700 / 2, this.sys.canvas.height / 2, 700, 0).setStrokeStyle(10, 0xffffff);
    let right_circle : Phaser.GameObjects.Arc = this.add.circle(this.sys.canvas.width + 700 / 2, this.sys.canvas.height / 2, 700, 0).setStrokeStyle(10, 0xffffff);
    player1 = this.physics.add.sprite(this.sys.canvas.width * 5 / 100, this.sys.canvas.height / 2, "bar");
    player1.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
    player2 = this.physics.add.sprite(this.sys.canvas.width * 95 / 100, this.sys.canvas.height / 2, "bar");
    player2.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
    powerUpBall = this.physics.add.sprite(this.sys.canvas.width / 2, this.sys.canvas.height / 2, "powerUp");
    powerUpBall.setDisplaySize(50, 50);
    powerUpBall.setVisible(false);
    powerUpBall.setOrigin(0.5, 0.5);
    ball = this.physics.add.sprite(this.sys.canvas.width / 2, this.sys.canvas.height / 2, "ball");
    ball.setDisplaySize(BALL_DIAMETER, BALL_DIAMETER);
    player1.setCollideWorldBounds(true);
    player2.setCollideWorldBounds(true);
    if (isHost){
        ball.setCollideWorldBounds(true);
        powerUpBall.setCollideWorldBounds(true);
    }
    ball.body.setAllowGravity(false);
    powerUpBall.body.setAllowGravity(false);
    player1.body.setAllowGravity(false);
    player2.body.setAllowGravity(false);
    player1.body.setImmovable(true);
    player2.body.setImmovable(true);
    player1.setDrag(3000);
    player2.setDrag(3000);
    keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    ball.body.world.on('worldbounds', function(this : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, body: Phaser.Physics.Arcade.Body, up: boolean, down: boolean, left: boolean, right: boolean) {
        if (body.gameObject === this && isHost) {
            if (right)
            {   
                scene.sound.play("bip");
                player1_score_obj.setText('' + ++player1_score);
                socket.emit('syncRound', { GameId: GameId, player1_score: player1_score, player2_score: player2_score});
                ball.body.velocity.setTo(0, 0);
                ball.setPosition(scene.sys.canvas.width / 2, scene.sys.canvas.height / 2);
                clock.delayedCall(1000, start_game, [], scene);
            }
            else if (left)
            {   
                scene.sound.play("bip");
                player2_score_obj.setText('' + ++player2_score);
                socket.emit('syncRound', { GameId: GameId, player1_score: player1_score, player2_score: player2_score});
                ball.body.velocity.setTo(0, 0);
                ball.setPosition(scene.sys.canvas.width / 2, scene.sys.canvas.height / 2);
                clock.delayedCall(1000, start_game, [], scene);
            }
            else if (down || up)
            {
                scene.sound.play("bip");
            }
        }
    }, ball);

    player1_score_obj = this.add.text(this.sys.canvas.width / 4, 20, '' + player1_score, {fontSize: '0px', fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
    player2_score_obj = this.add.text(this.sys.canvas.width / 4 * 3, 20, '' + player2_score, {fontSize: '0px', fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
    // timer_obj = this.add.text(this.sys.canvas.width / 2 - 32 / 2, 20, '' + player2_score, {fontSize: '50px', fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
    this.time.delayedCall(1000, start_game, [], this);
    if (isHost){
        local_player = player1;
        other_player = player2;
    } else {
        local_player = player2;
        other_player = player1;
    }
    if (isHost){
        this.physics.add.collider(ball, player1);
        this.physics.add.collider(ball, player2);
        this.physics.add.collider(powerUpBall, player1, setPowerUp, null, player1);
        this.physics.add.collider(powerUpBall, player2, setPowerUp, null, player2);
    }

    this.time.delayedCall(5000, showPowerUp, [], this);

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
        socket.emit('syncPowerUp', {"GameId":GameId, 'collided': 1});
    else
        socket.emit('syncPowerUp', {"GameId":GameId, 'collided': 2});
    this.setDisplaySize(this.displayWidth, this.displayHeight * 1.5);
    powerUpBall.setVelocity(0);
    powerUpBall.setVisible(false);
    powerUpBall.setRandomPosition(500, 500);
    scene.time.delayedCall(10000, showPowerUp, [], this);
    scene.time.delayedCall(5000, resetPlayerSize, [], this);
}

function showPowerUp(this: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody)
{
    powerUpBall.setVisible(true);
    scene.time.delayedCall(3000, enablePowerUps, [], this);
}

function update(this: Phaser.Scene) : void
{
    let cursors : Phaser.Types.Input.Keyboard.CursorKeys = this.input.keyboard.createCursorKeys();
    
    // first player movement
    // console.log(ball.x); 
    if (isHost){    
        socket.emit('syncBall', {"GameId":GameId, isVisible : powerUpBall.visible, isHost: isHost, ball: { x: ball.x, y: ball.y }});
        if (powerUpBall.visible)
            socket.emit('syncPowerUp', {"GameId":GameId, isHost: isHost, isVisible : powerUpBall.visible, powerUpBall: { x: powerUpBall.x, y: powerUpBall.y }});
        else if (!powerUpBall.visible)
        {
            socket.emit('syncPowerUp', {"GameId":GameId, isHost: isHost, isVisible : powerUpBall.visible, powerUpBall: { x: game.canvas.width / 2, y: game.canvas.height / 2 }});
        }
    }
    if (cursors.down.isDown && !cursors.up.isDown )
    {
        local_player.body.setVelocityY(+PLAYER_SPEED);
        socket.emit('sync', {"GameId":GameId, "down": "1", isHost: isHost});
        
    }
    else if (cursors.up.isDown && !cursors.down.isDown)
    {
        local_player.body.setVelocityY(-PLAYER_SPEED);
        socket.emit('sync', {"GameId":GameId, "up": "1", isHost: isHost});
    }
    
}

