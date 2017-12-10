var heartPickupCount = 0; 
var meatPickupCount = 0;
var current_level = 0; 


// =============================================================================
// Sprites
// =============================================================================

//
// Hero
//

function Hero(game, x, y) {
    // call Phaser.Sprite constructor
    Phaser.Sprite.call(this, game, x, y, 'hero');

    // anchor
    this.anchor.set(0.5, 0.5);
    // physics properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    // animations
    this.animations.add('stop', [0]);
    this.animations.add('run', [1, 2], 8, true); // 8fps looped
    this.animations.add('jump', [3]);
    this.animations.add('fall', [4]);
    this.animations.add('die', [5, 6, 5, 6, 5, 6, 5, 6], 12); // 12fps no loop
    // starting animation
    this.animations.play('stop');
}

// inherit from Phaser.Sprite
Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.move = function (direction) {
    // guard
    if (this.isFrozen) { return; }

    const SPEED = 200;
    this.body.velocity.x = direction * SPEED;

    // update image flipping & animations
    if (this.body.velocity.x < 0) {
        this.scale.x = -1;
    }
    else if (this.body.velocity.x > 0) {
        this.scale.x = 1;
    }
};

Hero.prototype.jump = function () {
    console.log("in jump function");
    const JUMP_SPEED = 600;

    if (this.body.touching.down) {
        console.log("true!");
        this.body.velocity.y = -JUMP_SPEED;
    }

};

Hero.prototype.stopJumpBoost = function () {
    this.isBoosting = false;
};

Hero.prototype.bounce = function () {
    const BOUNCE_SPEED = 200;
    this.body.velocity.y = -BOUNCE_SPEED;
};

Hero.prototype.update = function () {
    // update sprite animation, if it needs changing
    let animationName = this._getAnimationName();
    if (this.animations.name !== animationName) {
        this.animations.play(animationName);
    }
};

Hero.prototype.freeze = function () {
    this.body.enable = false;
    this.isFrozen = true;
};

Hero.prototype.die = function () {
    this.alive = false;
    this.body.enable = false;

    this.animations.play('die').onComplete.addOnce(function () {
        this.kill();
    }, this);
};

Hero.prototype.revive = function() {
    this.reset(21,525);
    this.alive = true;
    this.body.enable = true;
};

// returns the animation name that should be playing depending on
// current circumstances
Hero.prototype._getAnimationName = function () {
    let name = 'stop'; // default animation

    // dying
    if (!this.alive) {
        name = 'die';
    }
    // frozen & not dying
    else if (this.isFrozen) {
        name = 'stop';
    }
    // jumping
    else if (this.body.velocity.y < 0) {
        name = 'jump';
    }
    // falling
    else if (this.body.velocity.y >= 0 && !this.body.touching.down) {
        name = 'fall';
    }
    else if (this.body.velocity.x !== 0 && this.body.touching.down) {
        name = 'run';
    }

    return name;
};

//
// Spider (enemy)
//

function Spider(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'spider');

    // anchor
    this.anchor.set(0.5);
    // animation
    this.animations.add('crawl', [0, 1, 2], 8, true);
    this.animations.add('die', [0, 4, 0, 4, 0, 4, 3, 3, 3, 3, 3, 3], 12);
    this.animations.play('crawl');

    // physic properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    this.body.velocity.x = Spider.SPEED;
}

Spider.SPEED = 100;

// inherit from Phaser.Sprite
Spider.prototype = Object.create(Phaser.Sprite.prototype);
Spider.prototype.constructor = Spider;

Spider.prototype.update = function () {
    // check against walls and reverse direction if necessary
    if (this.body.touching.right || this.body.blocked.right) {
        this.body.velocity.x = -Spider.SPEED; // turn left
    }
    else if (this.body.touching.left || this.body.blocked.left) {
        this.body.velocity.x = Spider.SPEED; // turn right
    }
};

Spider.prototype.die = function () {
    this.body.enable = false;

    this.animations.play('die').onComplete.addOnce(function () {
        this.kill();
    }, this);
};

// =============================================================================
// Loading state
// =============================================================================

LoadingState = {};

LoadingState.init = function () {
    // keep crispy-looking pixels
    this.game.renderer.renderSession.roundPixels = true;
};

LoadingState.preload = function () {
    this.game.load.json('level:0', 'data/level00.json');
    this.game.load.json('level:1', 'data/level01.json');
    this.game.load.json('level:2', 'data/level02.json');

    this.game.load.image('font:numbers', 'images/numbers.png');

    this.game.load.image('icon:heart', 'images/heart_icon.png');
    this.game.load.image('background', 'images/background.png');
    this.game.load.image('invisible-wall', 'images/invisible_wall.png');
    this.game.load.image('ground', 'images/ground2.png');
    this.game.load.image('grass:8x1', 'images/grass2_8x1.png');
    this.game.load.image('grass:6x1', 'images/grass2_6x1.png');
    this.game.load.image('grass:4x1', 'images/grass2_4x1.png');
    this.game.load.image('grass:2x1', 'images/grass2_2x1.png');
    this.game.load.image('grass:1x1', 'images/grass2_1x1.png');
    this.game.load.image('key', 'images/key.png');

    this.game.load.image('titlescreen', 'images/titlescreen.png');
    this.game.load.image('button','images/button.png');
    this.game.load.image('logo','images/logo.png');
     this.game.load.image('rulescreen', 'images/rulescreen.png');
    this.game.load.image('gameoverscreen', 'images/background_gameover.png');
    this.game.load.image('badendingscreen', 'images/background_BADENDING.png')
    this.game.load.image('goodendingscreen', 'images/background_GOODENDING.png')

    //this.game.load.spritesheet('decoration', 'images/decor.png', 42, 42);
    this.game.load.spritesheet('hero', 'images/hero2.png', 36, 42);
    this.game.load.spritesheet('meat', 'images/meat_icon.png', 42, 42);
    this.game.load.spritesheet('veg', 'images/veg_icon.png', 42, 42);
    this.game.load.spritesheet('spider', 'images/ghost.png', 42, 32);
    this.game.load.spritesheet('door', 'images/door.png', 42, 66);
    this.game.load.spritesheet('icon:key', 'images/key_icon.png', 34, 30);

    this.game.load.audio('sfx:jump', 'audio/jump.wav');
    this.game.load.audio('sfx:coin', 'audio/coin.wav');
    this.game.load.audio('sfx:key', 'audio/key.wav');
    this.game.load.audio('sfx:stomp', 'audio/stomp.wav');
    this.game.load.audio('sfx:door', 'audio/door.wav');
    this.game.load.audio('bgm', ['audio/bgm.mp3', 'audio/bgm.ogg']);
    this.game.load.audio('good', 'audio/good.wav');
    this.game.load.audio('bad', 'audio/bad.wav');
};

LoadingState.create = function () {
    console.log("create Loading");
    this.game.state.start('gameMenu');
    //this.game.state.start('play', true, false, {level: 0});
};

// =============================================================================
// GameMenu state
// =============================================================================

GameMenu = {};

GameMenu.create = function() {
    console.log("create GameMenu");
    titlescreen = this.game.add.sprite(480, 300, 'titlescreen');
    titlescreen.anchor.setTo(0.5,0.5);
    this.game.add.sprite(275,75,'logo');
    
    this.createButton(game,"Play",350, 358 + 32, 200, 100, function() {this.game.state.start('play', true, false, {level: 0});});
    this.createButton(game,"Rules",600, 358 + 32, 200, 100, function() {this.game.state.start('Rules')});
};

GameMenu.createButton = function(game,string,x,y,w,h,callback) {
    console.log("in create button");
    var button1 = this.game.add.button(x,y,'button',callback, this,2,1,0);

    button1.anchor.setTo(0.5,0.5);
    button1.width = w;
    button1.height = h;

    var txt = this.game.add.text(button1.x,button1.y,string,{
      font:"25px Arial",
      fill: "#fff",
      align: "center"
    });

    txt.anchor.setTo(0.5,0.5);
  };

// =============================================================================
// Rules Route
// =============================================================================
Rules = {};

Rules.create = function() {
    titlescreen = this.game.add.sprite(480, 300, 'rulescreen');
    titlescreen.anchor.setTo(0.5,0.5);
    
    this.createButton(game,"Start Game",480, 460 + 32, 200, 100, function() {this.game.state.start('play', true, false, {level: 0});});
};

Rules.createButton = function(game,string,x,y,w,h,callback) {
    var button1 = this.game.add.button(x,y,'button',callback, this,2,1,0);

    button1.anchor.setTo(0.5,0.5);
    button1.width = w;
    button1.height = h;

    var txt = this.game.add.text(button1.x,button1.y,string,{
      font:"25px Arial",
      fill: "#fff",
      align: "center"
    });

    txt.anchor.setTo(0.5,0.5);
  };   

// =============================================================================
// Play state
// =============================================================================

PlayState = {};

const LEVEL_COUNT = 3;

PlayState.init = function (data) {
    this.keys = this.game.input.keyboard.createCursorKeys();

    this.hasKey = false;
    //this.level = data.level || 0) % LEVEL_COUNT;
    this.level = data.level;
    current_level = data.level; 

};

PlayState.create = function () {
    // fade in (from black)
    //this.camera.flash('#000000');

    // create sound entities
    this.sfx = {
        jump: this.game.add.audio('sfx:jump'),
        coin: this.game.add.audio('sfx:coin'),
        key: this.game.add.audio('sfx:key'),
        stomp: this.game.add.audio('sfx:stomp'),
        door: this.game.add.audio('sfx:door')
    };

    this.bgm = this.game.add.audio('bgm');
    this.bgm.loopFull();


    // create level entities and decoration
    this.game.add.image(0, 0, 'background');
    this._loadLevel(this.game.cache.getJSON(`level:${this.level}`));

    // create UI score boards
    this._createHud();
};

PlayState.update = function () {
    this._handleCollisions();
    this._handleInput();

    // update scoreboards
    this.heartFont.text = `x${heartPickupCount}`;
    this.keyIcon.frame = this.hasKey ? 1 : 0;
};

PlayState.shutdown = function () {
    this.bgm.stop();
};

PlayState._handleCollisions = function () {
    this.game.physics.arcade.collide(this.spiders, this.platforms);
    this.game.physics.arcade.collide(this.spiders, this.enemyWalls);
    this.game.physics.arcade.collide(this.hero, this.platforms);

    // hero vs meat(pick up)
    this.game.physics.arcade.overlap(this.hero, this.meats, this._onHeroVsMeat,
        null, this);
    // hero vs veg(pick up)
    this.game.physics.arcade.overlap(this.hero, this.vegs, this._onHeroVsVeg,
        null, this);
    // hero vs key (pick up)
    this.game.physics.arcade.overlap(this.hero, this.key, this._onHeroVsKey,
        null, this);
    // hero vs door (end level)
    this.game.physics.arcade.overlap(this.hero, this.door, this._onHeroVsDoor,
        // ignore if there is no key or the player is on air
        function (hero, door) {
            return this.hasKey && hero.body.touching.down;
        }, this);
    // collision: hero vs enemies (kill or die)
    this.game.physics.arcade.overlap(this.hero, this.spiders,
        this._onHeroVsEnemy, null, this);
};

PlayState._handleInput = function () {
    if (this.keys.left.isDown) { // move hero left
        this.hero.move(-1);
    }
    else if (this.keys.right.isDown) { // move hero right
        this.hero.move(1);
    }
    else { // stop
        this.hero.move(0);
    }

    // handle jump
    const JUMP_HOLD = 200; // ms
    if (this.keys.up.isDown) {
        this.hero.jump();
        //this.sfx.jump.play(); 
    }
    else {
        this.hero.stopJumpBoost();
    }
};

PlayState._onHeroVsKey = function (hero, key) {
    this.sfx.key.play();
    key.kill();
    this.hasKey = true;
};

PlayState._onHeroVsMeat = function (hero, meat) {
    this.sfx.coin.play();
    meat.kill();
    heartPickupCount = heartPickupCount + 2;
    meatPickupCount = meatPickupCount + 1;
};

PlayState._onHeroVsVeg = function (hero, veg) {
    this.sfx.coin.play();
    veg.kill();
    heartPickupCount = heartPickupCount + 1;
};

PlayState._onHeroVsEnemy = function (hero, enemy) {
    // the hero can kill enemies when is falling (after a jump, or a fall)
    if (hero.body.velocity.y > 0) {
        enemy.die();
        hero.bounce();
        this.sfx.stomp.play();
    }
    else { // game over -> play dying animation and restart the game
        hero.die();
        this.sfx.stomp.play();
        heartPickupCount = heartPickupCount - 1;
        hero.events.onKilled.addOnce(function () {
            if (heartPickupCount == 0) {
                heartPickupCount = 3; 
                meatPickupCount = 0; 
                this.game.state.start('gameOver');
            }
            else {
                this.hero.revive();
            }
        }, this);


        // NOTE: bug in phaser in which it modifies 'touching' when
        // checking for overlaps. This undoes that change so spiders don't
        // 'bounce' agains the hero
        enemy.body.touching = enemy.body.wasTouching;
    }
};

PlayState._onHeroVsDoor = function (hero, door) {
    // 'open' the door by changing its graphic and playing a sfx
    door.frame = 1;
    this.sfx.door.play();

    // play 'enter door' animation and change to the next level when it ends
    hero.freeze();
    this.game.add.tween(hero)
        .to({x: this.door.x, alpha: 0}, 500, null, true)
        .onComplete.addOnce(this._goToNextLevel, this);
};

PlayState._goToNextLevel = function () {
    this.camera.fade('#000000');
        // change to next level

        current_level = this.level + 1;
        if (current_level > 2) {
            if (meatPickupCount > 2) {this.game.state.start('badEnding');}
            else {
                this.game.state.start('goodEnding');
            }
        }
        else {
        this.game.state.restart(true, false, {
            level: this.level + 1,
        });
        };
};

PlayState._loadLevel = function (data) {
    // create all the groups/layers that we need
    this.bgDecoration = this.game.add.group();
    this.platforms = this.game.add.group();
    this.meats = this.game.add.group();
    this.vegs = this.game.add.group();
    this.spiders = this.game.add.group();
    this.enemyWalls = this.game.add.group();
    this.enemyWalls.visible = false;

    // spawn hero and enemies
    this._spawnCharacters({hero: data.hero, spiders: data.spiders});

    // spawn level decoration
   /* data.decoration.forEach(function (deco) {
        this.bgDecoration.add(
            this.game.add.image(deco.x, deco.y, 'decoration', deco.frame));
    }, this);*/

    // spawn platforms
    data.platforms.forEach(this._spawnPlatform, this);

    // spawn important objects
    data.meats.forEach(this._spawnMeat, this);
    data.vegs.forEach(this._spawnVeg, this);
    this._spawnKey(data.key.x, data.key.y);
    this._spawnDoor(data.door.x, data.door.y);

    // enable gravity
    const GRAVITY = 1200;
    this.game.physics.arcade.gravity.y = GRAVITY;
};

PlayState._spawnCharacters = function (data) {
    // spawn spiders
    data.spiders.forEach(function (spider) {
        let sprite = new Spider(this.game, spider.x, spider.y);
        this.spiders.add(sprite);
    }, this);

    // spawn hero
    this.hero = new Hero(this.game, data.hero.x, data.hero.y);
    this.game.add.existing(this.hero);
};

PlayState._spawnPlatform = function (platform) {
    let sprite = this.platforms.create(
        platform.x, platform.y, platform.image);

    // physics for platform sprites
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
    sprite.body.immovable = true;

    // spawn invisible walls at each side, only detectable by enemies
    this._spawnEnemyWall(platform.x, platform.y, 'left');
    this._spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');
};

PlayState._spawnEnemyWall = function (x, y, side) {
    let sprite = this.enemyWalls.create(x, y, 'invisible-wall');
    // anchor and y displacement
    sprite.anchor.set(side === 'left' ? 1 : 0, 1);
    // physic properties
    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
};

PlayState._spawnMeat = function (meat) {
    let sprite = this.meats.create(meat.x, meat.y, 'meat');
    sprite.anchor.set(0.5, 0.5);

    // physics (so we can detect overlap with the hero)
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;

    // animations
    //sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    //sprite.animations.play('rotate');
};

PlayState._spawnVeg = function (veg) {
    let sprite = this.vegs.create(veg.x, veg.y, 'veg');
    sprite.anchor.set(0.5, 0.5);

    // physics (so we can detect overlap with the hero)
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;

    // animations
    //sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    //sprite.animations.play('rotate');
};

PlayState._spawnKey = function (x, y) {
    this.key = this.bgDecoration.create(x, y, 'key');
    this.key.anchor.set(0.5, 0.5);
    // enable physics to detect collisions, so the hero can pick the key up
    this.game.physics.enable(this.key);
    this.key.body.allowGravity = false;

    // add a small 'up & down' animation via a tween
    this.key.y -= 3;
    this.game.add.tween(this.key)
        .to({y: this.key.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
        .yoyo(true)
        .loop()
        .start();
};

PlayState._spawnDoor = function (x, y) {
    this.door = this.bgDecoration.create(x, y, 'door');
    this.door.anchor.setTo(0.5, 1);
    this.game.physics.enable(this.door);
    this.door.body.allowGravity = false;
};

PlayState._createHud = function () {
    const NUMBERS_STR = '0123456789X ';
    this.heartFont = this.game.add.retroFont('font:numbers', 20, 26,
        NUMBERS_STR, 6);

    this.keyIcon = this.game.make.image(0, 19, 'icon:key');
    this.keyIcon.anchor.set(0, 0.5);

    let heartIcon = this.game.make.image(this.keyIcon.width + 7, 0, 'icon:heart');
    let heartScoreImg = this.game.make.image(heartIcon.x + heartIcon.width,
        heartIcon.height / 2, this.heartFont);
    heartScoreImg.anchor.set(0, 0.5);

    this.hud = this.game.add.group();
    this.hud.add(heartIcon);
    this.hud.add(heartScoreImg);
    this.hud.add(this.keyIcon);
    this.hud.position.set(10, 10);
};

// =============================================================================
// GameOver state
// =============================================================================
GameOver = {};

GameOver.create = function() {
    this.bad = this.game.add.audio('bad');
    this.bad.loopFull();
    heartPickupCount = 0; 
    meatPickupCount = 0;
    console.log("create GameMenu");
    titlescreen = this.game.add.sprite(480, 300, 'gameoverscreen');
    titlescreen.anchor.setTo(0.5,0.5);
    
    this.createButton(game,"Play Again",480, 358 + 32, 200, 100, function() {this.game.state.start('play', true, false, {level: 0});});
};

GameOver.shutdown = function () {
    this.bad.stop();
};

GameOver.createButton = function(game,string,x,y,w,h,callback) {
    console.log("in create button");
    var button1 = this.game.add.button(x,y,'button',callback, this,2,1,0);

    button1.anchor.setTo(0.5,0.5);
    button1.width = w;
    button1.height = h;

    var txt = this.game.add.text(button1.x,button1.y,string,{
      font:"25px Arial",
      fill: "#fff",
      align: "center"
    });

    txt.anchor.setTo(0.5,0.5);
  };

// =============================================================================
// BadEnding Route
// =============================================================================
BadEnding = {};

BadEnding.create = function() {
    this.bad = this.game.add.audio('bad');
    this.bad.loopFull();
    heartPickupCount = 0; 
    meatPickupCount = 0;
    titlescreen = this.game.add.sprite(480, 300, 'badendingscreen');
    titlescreen.anchor.setTo(0.5,0.5);
    
    this.createButton(game,"Play Again",480, 435 + 32, 200, 100, function() {this.game.state.start('play', true, false, {level: 0});});
};

BadEnding.shutdown = function () {
    this.bad.stop();
};

BadEnding.createButton = function(game,string,x,y,w,h,callback) {
    var button1 = this.game.add.button(x,y,'button',callback, this,2,1,0);

    button1.anchor.setTo(0.5,0.5);
    button1.width = w;
    button1.height = h;

    var txt = this.game.add.text(button1.x,button1.y,string,{
      font:"25px Arial",
      fill: "#fff",
      align: "center"
    });

    txt.anchor.setTo(0.5,0.5);
  }; 


// =============================================================================
// GoodEnding Route
// =============================================================================
GoodEnding = {};

GoodEnding.create = function() {
    this.good = this.game.add.audio('good');
    this.good.loopFull();
    heartPickupCount = 0; 
    meatPickupCount = 0;
    titlescreen = this.game.add.sprite(480, 300, 'goodendingscreen');
    titlescreen.anchor.setTo(0.5,0.5);
    
    this.createButton(game,"Play Again",480, 438 + 32, 200, 100, function() {this.game.state.start('play', true, false, {level: 0});});
};

GoodEnding.shutdown = function () {
    this.good.stop();
};

GoodEnding.createButton = function(game,string,x,y,w,h,callback) {
    var button1 = this.game.add.button(x,y,'button',callback, this,2,1,0);

    button1.anchor.setTo(0.5,0.5);
    button1.width = w;
    button1.height = h;

    var txt = this.game.add.text(button1.x,button1.y,string,{
      font:"25px Arial",
      fill: "#fff",
      align: "center"
    });

    txt.anchor.setTo(0.5,0.5);
  }; 




// =============================================================================
// entry point
// =============================================================================

window.onload = function () {
    let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
    game.state.add('play', PlayState);
    game.state.add('loading', LoadingState);
    game.state.add('gameMenu', GameMenu);
    game.state.add('gameOver', GameOver);
    game.state.add('badEnding', BadEnding);
    game.state.add('goodEnding', GoodEnding);
    game.state.add('Rules', Rules);
    game.state.start('loading');
};
