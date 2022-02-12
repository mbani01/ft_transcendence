// import { * } from "node_modules/socket.io-client/dist/socket.io.js";
const socket = io("http://10.12.8.9:3000");
let GameId : number;
let isHost: number;
let ball_position : {x: number, y: number};
// const socket = io("https://server-domain.com");


socket.on("connect", () => {
    console.log("Connnnected");
        // console.log(socket.id); // x8WIv7-mJelg7on_ALbx
  });

socket.emit('joinGame', { wsap: '1'});
socket.on("gameStarted", (obj : {GameId: number, ball: {x: number, y: number}, isHost: number}) => {
    game = new Phaser.Game(config);

    GameId = obj.GameId;
    isHost = obj.isHost;
    ball_position = obj.ball;
    console.log("joined");
    console.log(obj);
});

socket.on('sync', (obj) => {
    console.log(obj);
    if (obj.hasOwnProperty('down'))
    {
        // console.log(P)
        other_player.body.setVelocityY(+PLAYER_SPEED);
    }
    else if (obj.hasOwnProperty('up'))
    {
        other_player.body.setVelocityY(-PLAYER_SPEED);
    }
    // if (isHost)
    // {
    //     if (obj.isHost){
    //         if (obj.hasOwnProperty('down'))
    //             local_player.body.setVelocityY(+PLAYER_SPEED);
    //         if (obj.hasOwnProperty('up'))
    //             local_player.body.setVelocityY(-PLAYER_SPEED);
    //     }
    //     else{
    //         if (obj.hasOwnProperty('down'))
    //             other_player.body.setVelocityY(+PLAYER_SPEED);
    //         if (obj.hasOwnProperty('up'))
    //             other_player.body.setVelocityY(-PLAYER_SPEED);
    //     }
    // } else
    // {
    //     if (obj.isHost){
    //         if (obj.hasOwnProperty('down'))
    //             other_player.body.setVelocityY(+PLAYER_SPEED);
    //         if (obj.hasOwnProperty('up'))
    //             other_player.body.setVelocityY(-PLAYER_SPEED);
    //     }
    //     else{
    //         if (obj.hasOwnProperty('down'))
    //             local_player.body.setVelocityY(+PLAYER_SPEED);
    //         if (obj.hasOwnProperty('up'))
    //             local_player.body.setVelocityY(-PLAYER_SPEED);
    //     }
    // }

    // if (!isHost())
// )
    // ball.setPosition(obj.x, obj.y);
});

socket.on('syncBall', (obj) => {
    if(ball.x !== obj.ball.x || ball.y !== obj.ball.y)
    {
        // ball.sett
        ball.setPosition(obj.ball.x, obj.ball.y);
    }
});

// socket.emit('sync', {"GameId":game_id, "anythingyouwant": "anythingiwant"});
// setInterval(() => {
//     socket.emit('sync', {"GameId":game_id, "anythingyouwant": "anythingiwant"});
// }, 1000);

/*            hello world!          */
var config = {
    type: Phaser.AUTO,
    scale: {
        mode: 3,
        parent: 'phaser',
        autoCenter: 1,
        width: 800,
        height: 600,

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
// let game : Phaser.Game = new Phaser.Game(config);
let scene : Phaser.Scene;
let player1: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
let player2: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
let ball: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
let player1_score_obj : Phaser.GameObjects.Text;
let player2_score_obj : Phaser.GameObjects.Text;
let local_player : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
let other_player : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
let timer_obj : Phaser.GameObjects.Text;
let player1_score : number = 0;
let player2_score : number = 0;
let clock : Phaser.Time.Clock;

let PLAYER_SPEED: number = 500;
let BALL_SPEED: number = 200;
let BALL_DIAMETER : number = 30;
let PLAYER_WIDTH : number = 3;
let PLAYER_HEIGHT : number = 100;


function preload (this: Phaser.Scene) : void
{
    
    this.load.image("bar", "assets/bar.png");
    this.load.image("ball", "assets/ball1.png");
    this.load.audio("bip", "assets/bip.wav");
    // this.physics.add.collider(ball, player1);
    // this.physics.add.collider(ball, player2);
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
    // ball.x
    player1_score_obj.setFontSize(50);
    player2_score_obj.setFontSize(50);
}


function create (this: Phaser.Scene) : void
{
    // this.add.image(this.sys.canvas.width * 5 / 100, this.sys.canvas.height / 2, "bar");
    // this.add.image(this.sys.canvas.width / 2, this.sys.canvas.height / 2, "ball");
    scene = this;
    clock = this.time;
    let line : Phaser.GameObjects.Line = this.add.line(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 0, 0, 0, this.sys.canvas.height, 0xffffff);
    player1 = this.physics.add.sprite(this.sys.canvas.width * 5 / 100, this.sys.canvas.height / 2, "bar");
    player1.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
    player2 = this.physics.add.sprite(this.sys.canvas.width * 95 / 100, this.sys.canvas.height / 2, "bar");
    player2.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
    ball = this.physics.add.sprite(this.sys.canvas.width / 2, this.sys.canvas.height / 2, "ball");
    ball.setDisplaySize(BALL_DIAMETER, BALL_DIAMETER);
    player1.setCollideWorldBounds(true);
    player2.setCollideWorldBounds(true);
    if (isHost)
        ball.setCollideWorldBounds(true);
    ball.body.setAllowGravity(false);
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
                ball.body.velocity.setTo(0, 0);
                ball.setPosition(scene.sys.canvas.width / 2, scene.sys.canvas.height / 2);
                // socket.emit('ballReset', {"GameId":GameId, "up": "1", x: ball.x, y: ball.y});
                clock.delayedCall(4000, start_game, [], scene);
            }
            else if (left)
            {   
                scene.sound.play("bip");
                player2_score_obj.setText('' + ++player2_score);
                ball.body.velocity.setTo(0, 0);
                ball.setPosition(scene.sys.canvas.width / 2, scene.sys.canvas.height / 2);
                // socket.emit('ballReset', {"GameId":GameId, "up": "1", x: ball.x, y: ball.y});
                clock.delayedCall(4000, start_game, [], scene);
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
    this.time.delayedCall(4000, start_game, [], this);
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
    }
}

function update(this: Phaser.Scene) : void
{
    let cursors : Phaser.Types.Input.Keyboard.CursorKeys = this.input.keyboard.createCursorKeys();
    
    // first player movement
    // console.log(ball.x); 
    if (isHost){    
        socket.emit('syncBall', {"GameId":GameId, isHost: isHost, ball: { x: ball.x, y: ball.y }});
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
    

    // socket.emit('sync', {"GameId":GameId, x: ball.x, y: ball.y});
    // if (isHost)
    // {
    //     socket.emit('syncBall', {"GameId":GameId, "up": "1"});
    // }
    // second player movement
    // if (keyS.isDown && !keyA.isDown)
    // {
    //     player2.body.setVelocityY(+PLAYER_SPEED);
    // }
    // else if (keyA.isDown && !keyS.isDown)
    // {
    //     player2.body.setVelocityY(-PLAYER_SPEED);
    // }
}
