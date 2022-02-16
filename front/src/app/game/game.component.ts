import {Component, OnInit} from "@angular/core";
import Phaser from 'phaser';
import {MainSocket} from "../socket/MainSocket";
import GameConfig = Phaser.Types.Core.GameConfig;
// import {MainScene} from "./MainScene";

class MainScene extends Phaser.Scene {

  g: GameComponent;
  constructor(arg: any) {
    super({});
    console.log("DEFAULT");
    this.g = arg;
  }
  preload () : void
  {
    this.load.image("bar", "assets/bar.png");
    this.load.image("powerUp", "assets/pokeball.png");
    this.load.image("ball", "assets/whiteBall.png");
    this.load.audio("bip", "assets/bip.wav");
  }

  create () : void
  {
    let g = this.g;
    this.sound.pauseOnBlur = false;
    // game.events.addListener('blur', onHidden);
    // game.events.addListener('focus', onFocus);
    // game.events.off('hidden', game.events., game);
    g.scene = this;
    g.clock = this.time;
    let line: Phaser.GameObjects.Line = this.add.line(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 0, 0, 0, this.sys.canvas.height, 0xffffff).setLineWidth(5);
    let mid_circle: Phaser.GameObjects.Arc = this.add.circle(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 100, 0).setStrokeStyle(10, 0xffffff);
    let left_circle: Phaser.GameObjects.Arc = this.add.circle(-700 / 2, this.sys.canvas.height / 2, 700, 0).setStrokeStyle(10, 0xffffff);
    let right_circle: Phaser.GameObjects.Arc = this.add.circle(this.sys.canvas.width + 700 / 2, this.sys.canvas.height / 2, 700, 0).setStrokeStyle(10, 0xffffff);
    g.player1 = this.physics.add.sprite(this.sys.canvas.width * 1 / 100, this.sys.canvas.height / 2, "bar");
    g.player1.setDisplaySize(g.PLAYER_WIDTH, g.PLAYER_HEIGHT);
    g.player2 = this.physics.add.sprite(this.sys.canvas.width * 99 / 100, this.sys.canvas.height / 2, "bar");
    g.player2.setDisplaySize(g.PLAYER_WIDTH, g.PLAYER_HEIGHT);
    if (!g.isDefaultGame) {
      g.powerUpBall = this.physics.add.sprite(this.sys.canvas.width / 2, this.sys.canvas.height / 2, "powerUp");
      g.powerUpBall.setDisplaySize(50, 50);
      g.powerUpBall.setVisible(false);
      g.powerUpBall.setOrigin(0.5, 0.5);
    }
    g.ball = this.physics.add.sprite(this.sys.canvas.width / 2, this.sys.canvas.height / 2, "ball");
    g.ball.setDisplaySize(g.BALL_DIAMETER, g.BALL_DIAMETER);
    g.player1.setCollideWorldBounds(true);
    g.player2.setCollideWorldBounds(true);
    if (g.isHost) {
      g.ball.setCollideWorldBounds(true);
      if (!g.isDefaultGame) {
        g.powerUpBall.setCollideWorldBounds(true);
      }
    }
    g.ball.body.setAllowGravity(false);
    if (!g.isDefaultGame) {
      g.powerUpBall.body.setAllowGravity(false);
    }
    g.player1.body.setAllowGravity(false);
    g.player2.body.setAllowGravity(false);
    g.player1.body.setImmovable(true);
    g.player2.body.setImmovable(true);
    g.player1.setDrag(4000);
    g.player2.setDrag(4000);
    g.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    g.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    g.ball.body.world.on('worldbounds', function (this: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, body: Phaser.Physics.Arcade.Body, up: boolean, down: boolean, left: boolean, right: boolean) {
      if (body.gameObject === this && g.isHost) {
        g.scene.physics.world.removeCollider(g.player1_collider);
        g.scene.physics.world.removeCollider(g.player2_collider);
        g.ball.setAcceleration(0);
        if (right) {
          g.scene.sound.play("bip");
          g.player1_score_obj.setText('' + ++g.player1_score);
          g.socket.emit('syncRound', {GameId: g.GameId, player1_score: g.player1_score, player2_score: g.player2_score});
          g.ball.body.velocity.setTo(0, 0);
          g.ball.setPosition(g.scene.sys.canvas.width / 2, g.scene.sys.canvas.height / 2);
          g.clock.delayedCall(1000, g.start_game, [], g.scene);
        } else if (left) {
          g.scene.sound.play("bip");
          g.player2_score_obj.setText('' + ++g.player2_score);
          g.socket.emit('syncRound', {GameId: g.GameId, player1_score: g.player1_score, player2_score: g.player2_score});
          g.ball.body.velocity.setTo(0, 0);
          g.ball.setPosition(g.scene.sys.canvas.width / 2, g.scene.sys.canvas.height / 2);
          g.clock.delayedCall(1000, g.start_game, [], g.scene);
        } else if (down || up) {
          g.scene.sound.play("bip");
        }
      }
    }, g.ball);

    g.player1_score_obj = this.add.text(this.sys.canvas.width / 4, 20, '' + g.player1_score, {
      fontSize: '0px',
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif'
    });
    g.player2_score_obj = this.add.text(this.sys.canvas.width / 4 * 3, 20, '' + g.player2_score, {
      fontSize: '0px',
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif'
    });
    // timer_obj = this.add.text(this.sys.canvas.width / 2 - 32 / 2, 20, '' + player2_score, {fontSize: '50px', fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
    this.time.delayedCall(1000, g.start_game, [], this);
    if (g.isHost) {
      g.local_player = g.player1;
      g.other_player = g.player2;
    } else {
      g.local_player = g.player2;
      g.other_player = g.player1;
    }
    if (g.isHost) {
      this.physics.add.collider(g.ball, g.player1, g.HandleHit, undefined, g.player1);
      this.physics.add.collider(g.ball, g.player2, g.HandleHit, undefined, g.player2);
      if (!g.isDefaultGame) {
        this.physics.add.collider(g.powerUpBall, g.player1, g.setPowerUp, undefined, g.player1);
        this.physics.add.collider(g.powerUpBall, g.player2, g.setPowerUp, undefined, g.player2);
      }
    }

    if (!g.isDefaultGame)
      this.time.delayedCall(5000, g.showPowerUp, [], this);
    g.scene.time.addEvent({
      delay: 500,                // ms
      callback: function () {
        let x = g.ball.body.velocity.x;
        let y = g.ball.body.velocity.y;
        if (x != 0 && y != 0) {
          // ball.setAcceleration(100);
          // ball.body.setVelocity(x + 1000, y + 1000);
        }
      },
      //args: [],
      loop: true
    });
  }

  override update(this: Phaser.Scene) : void
  {
    let g = this.g;
    let cursors : Phaser.Types.Input.Keyboard.CursorKeys = this.input.keyboard.createCursorKeys();

    // first player movement
    // console.log(ball.x);
    if (g.isHost)
      g.socket.emit('syncBall', {"GameId":g.GameId, isVisible : false, isHost: g.isHost, ball: { x: g.ball.x, y: g.ball.y }});
    if (g.isHost && !g.isDefaultGame){
      if (g.powerUpBall.visible)
        g.socket.emit('syncPowerUp', {"GameId":g.GameId, isHost: g.isHost, isVisible : g.powerUpBall.visible, powerUpBall: { x: g.powerUpBall.x, y: g.powerUpBall.y }});
      else if (!g.powerUpBall.visible)
      {
        g.socket.emit('syncPowerUp', {"GameId":g.GameId, isHost: g.isHost, isVisible : g.powerUpBall.visible, powerUpBall: { x: g.game.canvas.width / 2, y: g.game.canvas.height / 2 }});
      }
    }
    if (cursors.down.isDown && !cursors.up.isDown )
    {
      g.local_player.body.setVelocityY(+g.PLAYER_SPEED);
      g.socket.emit('sync', {"GameId":g.GameId, "down": "1", isHost: g.isHost});

    }
    else if (cursors.up.isDown && !cursors.down.isDown)
    {
      g.local_player.body.setVelocityY(-g.PLAYER_SPEED);
      g.socket.emit('sync', {"GameId":g.GameId, "up": "1", isHost: g.isHost});
    }

  }

}

@Component({
  selector: 'app-game',
  templateUrl: 'game.component.html'
})
export class GameComponent implements OnInit {


// import { * } from "node_modules/socket.io-client/dist/socket.io.js";
// import {io} from "socket.io-client";
  public GameId : number;
  public isHost: number;
  public isDefaultGame : boolean;
  public ball_position : {x: number, y: number};
// const socket = io("https://server-domain.com");

  /*            hello world!          */

  public config: GameConfig;

  public game : Phaser.Game;
  public scene : Phaser.Scene;
  public player1: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  public player2: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  public ball: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  public powerUpBall: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  public player1_score_obj : Phaser.GameObjects.Text;
  public player2_score_obj : Phaser.GameObjects.Text;
  public local_player : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  public other_player : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  public timer_obj : Phaser.GameObjects.Text;
  public player1_score : number = 0;
  public player2_score : number = 0;
  public clock : Phaser.Time.Clock;
  public player1_collider : Phaser.Physics.Arcade.Collider ;
  public player2_collider : Phaser.Physics.Arcade.Collider ;

  public PLAYER_SPEED: number = 1000;
  public BALL_SPEED: number = 200;
  public BALL_DIAMETER : number = 50;
  public PLAYER_WIDTH : number = 3;
  public PLAYER_HEIGHT : number = 200;



  public keyA : Phaser.Input.Keyboard.Key;
  public keyS : Phaser.Input.Keyboard.Key;




  constructor(public socket: MainSocket) {
    this.config = {
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
// @ts-ignore
      scene: [MainScene.bind(this, this)]
    };
  }

ngOnInit() {
  console.log('HELLO');
  this.socket.on("connect", () => {
    console.log("Connnnected");
    // console.log(socket.id); // x8WIv7-mJelg7on_ALbx
  });

  this.socket.emit('joinDefaultGame', { wsap: '1'});


  this.socket.on("syncRound", (obj: any) => {
    // console.log("hello", obj);
    this.player1_score_obj.setText('' + obj.player1_score);
    this.player2_score_obj.setText('' + obj.player2_score);

  });

  this.socket.on("GameOver", (obj: any) => {
    if (obj.hasOwnProperty('disconnectedPlayer')){
      console.log("disco");
      this.ball.setVisible(false);
      this.game.scene.pause(this.scene);
      this.scene.add.text(this.game.canvas.width / 4, this.game.canvas.height / 3, 'other Player Disconnected', {fontSize: '100px', fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
    } else {
      console.log("win");
      this.ball.setVisible(false);
      this.game.scene.pause(this.scene);
      this.scene.add.text(this.game.canvas.width / 4, this.game.canvas.height / 3, 'game over', {fontSize: '100px', fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
    }
  });

  this.socket.on("gameStarted", (obj : any) => {
    this.game = new Phaser.Game(this.config);
    this.GameId = obj.GameId;
    this.isHost = obj.isHost;
    this.ball_position = obj.ball;
    console.log("joined");
    this.isDefaultGame = obj.isDefaultGame;
    // console.log(obj);
  });

  this.socket.on('sync', (obj: any) => {
    // console.log(obj);
    if (obj.hasOwnProperty('down'))
    {
      // console.log(P)
      this.other_player.body.setVelocityY(+this.PLAYER_SPEED);
    }
    else if (obj.hasOwnProperty('up'))
    {
      this.other_player.body.setVelocityY(-this.PLAYER_SPEED);
    }
  });

  this.socket.on('syncBall', (obj: any) => {
    if(this.ball.x !== obj.ball.x || this.ball.y !== obj.ball.y)
    {
      this.ball.setPosition(obj.ball.x, obj.ball.y);
    }
  });

  this.socket.on('syncPowerUp', (obj: any) => {
    this.powerUpBall.setVisible(obj.isVisible);
    if (obj.hasOwnProperty('collided'))
    {
      if (obj.collided == 1)
      {
        this.player1.setDisplaySize(this.player1.displayWidth, this.player1.displayHeight * 1.5);
        // scene.time.delayedCall(10000, showPowerUp, [], player1);
        this.scene.time.delayedCall(5000, this.resetPlayerSize, [], this.player1);
      }
      else
      {
        this.player2.setDisplaySize(this.player2.displayWidth, this.player2.displayHeight * 1.5);
        // scene.time.delayedCall(10000, showPowerUp, [], player2);
        this.scene.time.delayedCall(5000, this.resetPlayerSize, [], this.player2);
      }
    }
    else if(this.powerUpBall.x !== obj.powerUpBall.x || this.powerUpBall.y !== obj.powerUpBall.y)
    {
      // powerUpBall.setVisible(true);
      this.powerUpBall.setPosition(obj.powerUpBall.x, obj.powerUpBall.y);
    }
  });
  this.socket.on('focusLose', (obj: any) => {
    console.log(obj, this.game.hasFocus);
    if (obj.focus == false)
      this.game.scene.pause(this.scene);
    else if (this.game.hasFocus == true)
      this.game.scene.resume(this.scene);
  });
}

preload () : void
{
  let scene1 = this;
  let scene = <Phaser.Scene><unknown>scene1;
  console.log(scene);
  console.log(scene.load.image("bar", "assets/bar.png"));
  scene.load.image("powerUp", "assets/pokeball.png");
  scene.load.image("ball", "assets/whiteBall.png");
  scene.load.audio("bip", "assets/bip.wav");
}

start_game() : void
{
  let thisScene = <Phaser.Scene><unknown>this;
  this.ball.setPosition(this.game.canvas.width /     2, this.game.canvas.height / 2);
  // this.ball.body.onWorldBounds = true;
  if (this.isHost){
    this.ball.body.velocity.setTo(this.ball_position.x, this.ball_position.y);
    this.ball.setBounce(1);
    // @ts-ignore
    thisScene.physics.add.collider(this.ball, this.player1, this.HandleHit, undefined, this.player1);
    // @ts-ignore
    thisScene.physics.add.collider(this.ball, this.player2, this.HandleHit, undefined, this.player2);
  }
  this.player1_score_obj.setFontSize(100);
  this.player2_score_obj.setFontSize(100);
}

onHidden() : void
{
  // socket.emit('focusLose', { GameId: GameId, isHost: isHost, focus: false });
  console.log("hidden");
}


onFocus() : void
{
  this.socket.emit('focusLose', { GameId: this.GameId, isHost: this.isHost, focus: true });
}

create () : void
{
  let scene = <Phaser.Scene><unknown>this;

  scene.sound.pauseOnBlur = false;
  // game.events.addListener('blur', onHidden);
  // game.events.addListener('focus', onFocus);
  // game.events.off('hidden', game.events., game);
  this.scene = scene;
  this.clock = scene.time;
  let line : Phaser.GameObjects.Line = scene.add.line(scene.sys.canvas.width / 2, scene.sys.canvas.height / 2, 0, 0, 0, scene.sys.canvas.height, 0xffffff).setLineWidth(5);
  let mid_circle : Phaser.GameObjects.Arc = scene.add.circle(scene.sys.canvas.width / 2, scene.sys.canvas.height / 2, 100, 0).setStrokeStyle(10, 0xffffff);
  let left_circle : Phaser.GameObjects.Arc = scene.add.circle(-700 / 2, scene.sys.canvas.height / 2, 700, 0).setStrokeStyle(10, 0xffffff);
  let right_circle : Phaser.GameObjects.Arc = scene.add.circle(scene.sys.canvas.width + 700 / 2, scene.sys.canvas.height / 2, 700, 0).setStrokeStyle(10, 0xffffff);
  this.player1 = scene.physics.add.sprite(scene.sys.canvas.width * 1 / 100, scene.sys.canvas.height / 2, "bar");
  this.player1.setDisplaySize(this.PLAYER_WIDTH, this.PLAYER_HEIGHT);
  this.player2 = scene.physics.add.sprite(scene.sys.canvas.width * 99 / 100, scene.sys.canvas.height / 2, "bar");
  this.player2.setDisplaySize(this.PLAYER_WIDTH, this.PLAYER_HEIGHT);
  if (!this.isDefaultGame){
    this.powerUpBall = scene.physics.add.sprite(scene.sys.canvas.width / 2, scene.sys.canvas.height / 2, "powerUp");
    this.powerUpBall.setDisplaySize(50, 50);
    this.powerUpBall.setVisible(false);
    this.powerUpBall.setOrigin(0.5, 0.5);
  }
  this.ball = scene.physics.add.sprite(scene.sys.canvas.width / 2, scene.sys.canvas.height / 2, "ball");
  this.ball.setDisplaySize(this.BALL_DIAMETER, this.BALL_DIAMETER);
  this.player1.setCollideWorldBounds(true);
  this.player2.setCollideWorldBounds(true);
  if (this.isHost){
    this.ball.setCollideWorldBounds(true);
    if (!this.isDefaultGame){
      this.powerUpBall.setCollideWorldBounds(true);
    }
  }
  this.ball.body.setAllowGravity(false);
  if (!this.isDefaultGame){
    this.powerUpBall.body.setAllowGravity(false);
  }
  this.player1.body.setAllowGravity(false);
  this.player2.body.setAllowGravity(false);
  this.player1.body.setImmovable(true);
  this.player2.body.setImmovable(true);
  this.player1.setDrag(4000);
  this.player2.setDrag(4000);
  this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  this.keyS = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  this.ball.body.world.on('worldbounds', (scene : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, body: Phaser.Physics.Arcade.Body, up: boolean, down: boolean, left: boolean, right: boolean) => {
    if (body.gameObject === scene && this.isHost) {
      this.scene.physics.world.removeCollider(this.player1_collider);
      this.scene.physics.world.removeCollider(this.player2_collider);
      this.ball.setAcceleration(0);
      if (right)
      {
        this.scene.sound.play("bip");
        this.player1_score_obj.setText('' + ++this.player1_score);
        this.socket.emit('syncRound', { GameId: this.GameId, player1_score: this.player1_score, player2_score: this.player2_score});
        this.ball.body.velocity.setTo(0, 0);
        this.ball.setPosition(this.scene.sys.canvas.width / 2, this.scene.sys.canvas.height / 2);
        this.clock.delayedCall(1000, this.start_game, [], this.scene);
      }
      else if (left)
      {
        this.scene.sound.play("bip");
        this.player2_score_obj.setText('' + ++this.player2_score);
        this.socket.emit('syncRound', { GameId: this.GameId, player1_score: this.player1_score, player2_score: this.player2_score});
        this.ball.body.velocity.setTo(0, 0);
        this.ball.setPosition(this.scene.sys.canvas.width / 2, this.scene.sys.canvas.height / 2);
        this.clock.delayedCall(1000, this.start_game, [], this.scene);
      }
      else if (down || up)
      {
        this.scene.sound.play("bip");
      }
    }
  }, this.ball);

  this.player1_score_obj = scene.add.text(scene.sys.canvas.width / 4, 20, '' + this.player1_score, {fontSize: '0px', fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
  this.player2_score_obj = scene.add.text(scene.sys.canvas.width / 4 * 3, 20, '' + this.player2_score, {fontSize: '0px', fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
  // timer_obj = scene.add.text(scene.sys.canvas.width / 2 - 32 / 2, 20, '' + player2_score, {fontSize: '50px', fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
  scene.time.delayedCall(1000, this.start_game, [], scene);
  if (this.isHost){
    this.local_player = this.player1;
    this.other_player = this.player2;
  } else {
    this.local_player = this.player2;
    this.other_player = this.player1;
  }
  if (this.isHost){
    // @ts-ignore
    scene.physics.add.collider(this.ball, this.player1, this.HandleHit, null, this.player1);
    // @ts-ignore
    scene.physics.add.collider(this.ball, this.player2, this.HandleHit, null, this.player2);
    if (!this.isDefaultGame){
      // @ts-ignore
      scene.physics.add.collider(this.powerUpBall, this.player1, this.setPowerUp, null, this.player1);
      // @ts-ignore
      scene.physics.add.collider(this.powerUpBall, this.player2, this.setPowerUp, null, this.player2);
    }
  }

  if (!this.isDefaultGame)
    scene.time.delayedCall(5000, this.showPowerUp, [], scene);
  this.scene.time.addEvent({
    delay: 500,                // ms
    callback: () => {
      let x = this.ball.body.velocity.x;
      let y = this.ball.body.velocity.y;
      if (x != 0 && y != 0)
      {
        // ball.setAcceleration(100);
        // ball.body.setVelocity(x + 1000, y + 1000);
      }
    },
    //args: [],
    loop: true
  });

}

HandleHit()
{
  let scene = <Phaser.Types.Physics.Arcade.SpriteWithDynamicBody><unknown>this;

  if (scene.y < this.ball.y)
  {
    this.ball.setVelocityY(-10 * (scene.y - this.ball.y));
  }
  else if (scene.y > this.ball.y)
  {
    this.ball.setVelocityY(10 * (this.ball.y - scene.y));
    console.log("right");
  }
}

enablePowerUps() : void
{
  if (this.isHost)
    this.powerUpBall.setVelocity(1000);
  this.powerUpBall.setBounce(1);
}

resetPlayerSize()
{
  let scene = <Phaser.Types.Physics.Arcade.SpriteWithDynamicBody><unknown>this;

  scene.setDisplaySize(this.PLAYER_WIDTH, this.PLAYER_HEIGHT);
}

setPowerUp()
{
  let scene = <Phaser.Types.Physics.Arcade.SpriteWithDynamicBody><unknown>this;

  if (scene == this.player1)
    this.socket.emit('syncPowerUp', {"GameId":this.GameId, 'collided': 1});
  else
    this.socket.emit('syncPowerUp', {"GameId":this.GameId, 'collided': 2});
  scene.setDisplaySize(scene.displayWidth, scene.displayHeight * 1.5);
  this.powerUpBall.setPosition(-200, -200);
  this.powerUpBall.setVelocity(0);
  this.powerUpBall.setVisible(false);
  this.scene.time.delayedCall(10000, this.showPowerUp, [], scene);
  this.scene.time.delayedCall(5000, this.resetPlayerSize, [], scene);
}

showPowerUp()
{
  let scene = <Phaser.Types.Physics.Arcade.SpriteWithDynamicBody><unknown>this;

  this.powerUpBall.setRandomPosition(0, 0, this.game.canvas.width, this.game.canvas.height);
  this.powerUpBall.setVisible(true);
  this.scene.time.delayedCall(3000, this.enablePowerUps, [], scene);
}

update() : void
{
  let scene = <Phaser.Scene><unknown>this;

  let cursors : Phaser.Types.Input.Keyboard.CursorKeys = scene.input.keyboard.createCursorKeys();

  // first player movement
  // console.log(ball.x);
  if (this.isHost)
    this.socket.emit('syncBall', {"GameId":this.GameId, isVisible : false, isHost: this.isHost, ball: { x: this.ball.x, y: this.ball.y }});
  if (this.isHost && !this.isDefaultGame){
    if (this.powerUpBall.visible)
      this.socket.emit('syncPowerUp', {"GameId":this.GameId, isHost: this.isHost, isVisible : this.powerUpBall.visible, powerUpBall: { x: this.powerUpBall.x, y: this.powerUpBall.y }});
    else if (!this.powerUpBall.visible)
    {
      this.socket.emit('syncPowerUp', {"GameId":this.GameId, isHost: this.isHost, isVisible : this.powerUpBall.visible, powerUpBall: { x: this.game.canvas.width / 2, y: this.game.canvas.height / 2 }});
    }
  }
  if (cursors.down.isDown && !cursors.up.isDown )
  {
    this.local_player.body.setVelocityY(+this.PLAYER_SPEED);
    this.socket.emit('sync', {"GameId":this.GameId, "down": "1", isHost: this.isHost});

  }
  else if (cursors.up.isDown && !cursors.down.isDown)
  {
    this.local_player.body.setVelocityY(-this.PLAYER_SPEED);
    this.socket.emit('sync', {"GameId":this.GameId, "up": "1", isHost: this.isHost});
  }

}



}
