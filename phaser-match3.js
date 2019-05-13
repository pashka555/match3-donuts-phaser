

var game = new Phaser.Game(1280,960, Phaser.CANVAS, 'test', {preload : loadResources, create: onCreate })

//game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL; 

var DONUTTypes = [{color:1, type:0, img:'donut-01'},
                {color:2, type:0, img:"donut-02"},
                {color:3, type:0, img:"donut-03"},
                {color:4, type:0, img:"donut-04"},
                {color:5, type:0, img:"donut-05"},
                {color:6, type:0, img:"donut-06"}];


var donutTypeImg;

var DONUT_SIZE = 64; //size is yet unknown, but let's roll with that for the time being?
var DONUT_SPACING = 20; // size of donut spacing
var DONUT_SPACE_TOP_MARGIN = 200 //top margin
var DONUT_SPACE_LEFT_MARGIN = 320
var DONUT_SIZE_SPACED = DONUT_SIZE + DONUT_SPACING; 
var BOARD_COLS;
var BOARD_ROWS;
var MATCH_MIN = 3; // min number of same color donuts required in a row to be considered a match

var donuts;
var selectedDonut = null;
var selectedDonutStartPos;
var selectedDonutTween;
var tempShiftedDonut = null;
var allowInput;

var score_text;

var score_var = {
    value: 0,
    get score() {
        return(this.value)
    } ,
    set score(v) {
        this.value = v;
        updateScoreBoard();
    }
};

var style = {font: "40px FredokaOne", fill: "#eeeeee"};

score_var.value=0;
var timer;

var bgm;

var killSound;

//var emitter;

document.fonts.ready.then(function () {
    //alert('All fonts in use by visible text have loaded.');
    // alert('Fredoka loaded? ' + document.fonts.check('FredokaOne'));  // true
    style = {font: "40px FredokaOne", fill: "#eeeeee"};
});

function loadResources() {
    game.load.image('background', 'images/backgrounds/background.jpg')
    donutTypeImg = [game.load.image('donut-01', 'images/game/gem-01.png'),
    game.load.image('donut-02', 'images/game/gem-02.png'),
    game.load.image('donut-03', 'images/game/gem-03.png'),
    game.load.image('donut-04', 'images/game/gem-04.png'),
    game.load.image('donut-05', 'images/game/gem-05.png'),
    game.load.image('donut-06', 'images/game/gem-06.png'),
    ];

    particleImg = [game.load.image('particle-1','images/particles/particle-1.png'),
    game.load.image('particle-2','images/particles/particle-2.png'),
    game.load.image('particle-3','images/particles/particle-3.png'),
    game.load.image('particle-4','images/particles/particle-4.png'),
    game.load.image('particle-5','images/particles/particle-5.png'),
    game.load.image('particle-ex1','images/particles/particle_ex1.png'),
    game.load.image('particle-ex2','images/particles/particle_ex2.png'),
    game.load.image('particle-ex3','images/particles/particle_ex3.png')]

    bdImage = game.load.image('big-donut', 'images/donut.png');
    game.load.image('button','images/btn-play.png')
    game.load.image('big-donut-shadow','images/big-shadow.png')
    game.load.image('donuts!logo', "images/donuts_logo.png"); 

    game.load.image('scoreboard','images/bg-score.png');

    game.load.image('timeup','images/text-timeup.png');

    game.load.image("tray",'images/back_tray.png');

    game.load.image('smallshadow','images/game/shadow.png');

    game.load.audio('bgm', 'audio/background.mp3');
    game.load.audio('kill', 'audio/kill.mp3');
    game.load.audio('select', ['audio/select-1.mp3','audio/select-2.mp3','audio/select-3.mp3','audio/select-4.mp3','audio/select-5.mp3','audio/select-6.mp3',
    'audio/select-7.mp3','audio/select-8.mp3','audio/select-9.mp3']);
    //game.load.audio('', ['audio/bodenstaendig_2000_in_rock_4bit.mp3']);
} //should load resources

function onCreate() {
    //game.physics.startSystem(Phaser.Physics.ARCADE);

    //emitter = game.add.emitter(0, 0, 10);

    //emitter.makeParticles(['particle-1','particle-2','particle-3','particle-4','particle-5','particle-ex1','particle-ex2','particle-ex3']);

    game.world.backgroundcolor = "#FFFFFF"

    killSound = game.add.audio('kill');

    var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    alert(x + ' × ' + y);

    //game.world.scale.x = x/1280;
    //game.world.scale.y = y/960;
    //game.stage.scale.startFullScreen();

    //game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL; 

//    game.physics.arcade.gravity.y = 600;

    //game.world.bringToTop(emitter);

    toMenu();
}

//jumps from menu to game and back, how they're done
function toMenu() {
    unloadGame();
    this.bg = this.game.add.tileSprite(0, 0, game.world.width, game.cache.getImage('background').height, 'background');

    var bgm = 

    logo = game.add.sprite(game.world.centerX, -500, 'donuts!logo');

    logo.anchor.x = 0.5;
    logo.anchor.y = 0.5;


    logotween = game.add.tween(logo);

    bgm = game.sound.play('bgm');

    logotween.to({y:game.world.centerY},1000,'Linear',true,0);

    game.time.events.add(500, dropBigDonut);

    startGameButton = game.add.button(game.world.centerX, game.world.centerY * 1.45 , 'button', toGame, this, 2,1,0);
    startGameButton.anchor.x=0.5;
    startGameButton.anchor.y=0.5;
} //should draw menu. TODO

function dropBigDonut() {


    bigDonut = game.add.sprite(game.world.centerX-455,-500,'big-donut-shadow');

    bigDonut.scale.setTo(0.35,0.35);

    bigDonut.addChild(game.add.sprite(0,0,"big-donut"));

    bdtween = game.add.tween(bigDonut);

    bdtween.to({y:game.world.centerX*0.45},1000,'Linear',true,0);
}

function unloadMenu() {
    if(typeof startGameButton !== 'undefined') {
        startGameButton.kill();
    }
    if(typeof logo !== 'undefined') {
        logo.kill();
    }
    //logotween.kill();
    if(typeof bigDonut !== 'undefined') {
        bigDonut.kill();
        
    } else game.time.events.add(1000,unloadMenu,this);

    game.sound.stopAll();
    //bdShadow.kill();
}

function toGame() {
    unloadMenu(); //unloadMenu

    timer = 60;

    spawnBoard(); //fill screen

    // selected donut position, prevents sliding for more than one tile
    selectedDonutStartPos = { x: 0, y: 0 };
    
    // input is disabled while game drops the donuts
    allowInput = false;

    game.input.addMoveCallback(slideDonut, this);

    score_var.score = 0;

    score_board = game.add.sprite(game.world.centerX, game.world.centerY*0.25,"scoreboard");

    score_board.anchor.x = 0.5;
    score_board.anchor.y = 0.5;

    score_text = this.game.add.text(0,0,'00000', style);
    score_text.anchor.x=0.5;
    score_text.anchor.y=0.75;
    game.world.bringToTop(score_text);
    score_board.addChild(score_text);

    game.time.events.add(1000, this.timerTick, this);
    //game.world.bringToTop(emitter);
} //spawns board, starts the game

function unloadGame() {
    if(typeof donuts !== 'undefined') {
        donuts.kill();
    }
    if(typeof score_board !== 'undefined') {
        score_board.kill();
    }

    timer = 0;
}

function pauseMenu() {} //??? maybe

//SET UP AND OTHER VITAL FUNCTIONS (GET,SET)

function spawnBoard() {

    //BOARD_COLS = Math.floor(game.world.width / DONUT_SIZE_SPACED);
    //BOARD_ROWS = Math.floor(game.world.height / DONUT_SIZE_SPACED);
    BOARD_COLS = 8;
    BOARD_ROWS = 8;
    //alert(BOARD_ROWS);

    tray = game.add.sprite(DONUT_SPACE_LEFT_MARGIN-50,DONUT_SPACE_TOP_MARGIN-50,'tray');

    //tray.frame.width = 700;
    //tray.frame.height = 800;

    tray.scale.setTo(1,1.35);

    donuts = game.add.group();

    donuts.centerX = DONUT_SPACE_LEFT_MARGIN;
    donuts.centerY = DONUT_SPACE_TOP_MARGIN;

    for (var i = 0; i < BOARD_COLS; i++)
    {
        for (var j = 0; j < BOARD_ROWS; j++)
        {
            var type = selectRandomType();
            
            var donut = donuts.create(i * DONUT_SIZE_SPACED, j * DONUT_SIZE_SPACED, "smallshadow");
            donut.donutType = type;
            donut.name = 'donut' + i.toString() + 'x' + j.toString();
            donut.inputEnabled = true;
            donut.events.onInputDown.add(selectDonut, this);
            donut.events.onInputUp.add(releaseDonut, this);
            donut.addChild(game.add.sprite(0,0,type.img));
            donut.children[0]
            donut.children[0].anchor.x = +0.12;
            donut.children[0].anchor.y = +0.12;
            donut.children[0].sendToBack();
            donut.bringToTop();
            //temp_emitter = game.add.emitter(0, 0, 10);
            //temp_emitter.makeParticles(['particle-1','particle-2','particle-3','particle-4','particle-5','particle-ex1','particle-ex2','particle-ex3']);
            //temp_emitter.position.x = donut.world.x;
            //temp_emitter.position.y = donut.world.y;
            //donut.addChild(temp_emitter);
            //randomizeDonutColor(donut);
            setDonutPos(donut, i, j); // each donut has a position on the board
            donut.kill();
        }
    }

    removeKilledDonuts();

    var dropDonutDuration = dropDonuts();

    // delay board refilling until all existing donuts have dropped down
    game.time.events.add(dropDonutDuration * 100, refillBoard);

    allowInput = false;

    selectedDonut = null;
    tempShiftedDonut = null;

    // refillBoard();
} //creates a grid of donut Objects, fills it

function selectRandomType() {
    return(DONUTTypes[game.rnd.integerInRange(0, 5)]);
}

// select a donut and remember its starting position
function selectDonut(donut) {

    if (allowInput)
    {
        game.sound.play('select');
        selectedDonut = donut;
        selectedDonutStartPos.x = donut.posX;
        selectedDonutStartPos.y = donut.posY;
    }

}

// find a donut on the board according to its position on the board
function getDonut(posX, posY) {

    return donuts.iterate("id", calcDonutId(posX, posY), Phaser.Group.RETURN_CHILD);

}

// convert world coordinates to board position
function getDonutPos(coordinate) {

    return Math.floor(coordinate / DONUT_SIZE_SPACED);

}

// set the position on the board for a donut
function setDonutPos(donut, posX, posY) {

    donut.posX = posX;
    donut.posY = posY;
    donut.id = calcDonutId(posX, posY);

}

// the donut id is used by getDonut() to find specific donuts in the group
// each position on the board has a unique id
function calcDonutId(posX, posY) {

    return posX + posY * BOARD_COLS;

}

// select a donut and remember its starting position
//function selectdonut(donut) {}

function tweenDonutPos(donut, newPosX, newPosY, durationMultiplier) {

    //console.log('Tween ',donut.name,' from ',donut.posX, ',', donut.posY, ' to ', newPosX, ',', newPosY);
    if (durationMultiplier === null || typeof durationMultiplier === 'undefined')
    {
        durationMultiplier = 1;
    }

    //game.add.tween(donut.children[0]).to({x: newPosX  * DONUT_SIZE_SPACED, y: newPosY * DONUT_SIZE_SPACED}, 100 * durationMultiplier, Phaser.Easing.Linear.None, true);
    return game.add.tween(donut).to({x: newPosX  * DONUT_SIZE_SPACED, y: newPosY * DONUT_SIZE_SPACED}, 100 * durationMultiplier, Phaser.Easing.Linear.None, true);
    
}//animated donut movement? 

// find a donut on the board according to its position on the board
//function getDonut(posX, posY) {}

// convert world coordinates to board position
//function getDonutPos(coordinate) {}

// set the position on the board for a donut
//function setDonutPos(donut, posX, posY) {}

// the donut id is used by getdonut() to find specific donuts in the group
// each position on the board has a unique id
//function calcDonutId(posX, posY) {}

//Checking a numeric property directly instead
//function getDonutColor(donut) {} //should add a property to each donut, a numeric one.

//MAIN LOGIC FUNCTIONS

// count how many donuts of the same color lie in a given direction
// eg if moveX=1 and moveY=0, it will count how many donuts of the same color lie to the right of the donut
// stops counting as soon as a donut of a different color or the board end is encountered
function countSameColorDonuts(startDonut, moveX, moveY, count) { //redoing using recursive calls, hope it doesn't fall apart

    var curX = startDonut.posX;
    var curY = startDonut.posY;
    //var count = 0; //start with one?
    if(getDonut(curX + moveX, curY + moveY) !== null && getDonut(curX + moveX, curY + moveY).donutType.color == startDonut.donutType.color) {
        return(countSameColorDonuts(getDonut(curX + moveX, curY + moveY), moveX, moveY, count+1));
    } else {
        return(count);
    }
//    while (curX >= 0 && curY >= 0 && curX < BOARD_COLS && curY < BOARD_ROWS && getDonutColor(getDonut(curX, curY)) === getDonutColor(startDonut))
//    {
//        count++;
//        curX += moveX;
//        curY += moveY;
//    }

//    return count;

}

// count how many donuts of the same color are above, below, to the left and right
// if there are more than 3 matched horizontally or vertically, kill those donuts
// if no match was made, move the donuts back into their starting positions
function checkAndKillDonutMatches(donut) {

    if (donut === null) { return; }

    var canKill = false;

    // process the selected donut

    var countUp = countSameColorDonuts(donut, 0, -1,0);
    var countDown = countSameColorDonuts(donut, 0, 1,0);
    var countLeft = countSameColorDonuts(donut, -1, 0,0);
    var countRight = countSameColorDonuts(donut, 1, 0,0);

    var countHoriz = countLeft + countRight + 1; //countSameColorDonuts(donut, -1, 0, 0) + countSameColorDonuts(donut, 1, 0, 0) + 1;
    var countVert = countDown + countUp + 1;//countSameColorDonuts(donut, 0, -1, 0) + countSameColorDonuts(donut, 0, 1, 0) + 1;

    if (countVert >= MATCH_MIN)
    {
        killSound.play();
        killDonutRange(donut.posX, donut.posY - countUp, donut.posX, donut.posY + countDown);
        canKill = true;
    }

    if (countHoriz >= MATCH_MIN)
    {
        killSound.play();
        killDonutRange(donut.posX - countLeft, donut.posY, donut.posX + countRight, donut.posY);
        canKill = true;
    }

    return canKill;

}

// set the donut to a random color and number
// function randomizeDonutColor(donut) {} 
//Using select random type instead, and assigning the type to donut instead. Could also return the donut object here but let's keep it simple

// donuts can only be moved 1 square up/down or left/right
// donuts can only be moved 1 square up/down or left/right
function checkIfDonutCanBeMovedHere(fromPosX, fromPosY, toPosX, toPosY) {

    if (toPosX < 0 || toPosX >= BOARD_COLS || toPosY < 0 || toPosY >= BOARD_ROWS)
    {
        return false;
    }

    if (fromPosX === toPosX && fromPosY >= toPosY - 1 && fromPosY <= toPosY + 1)
    {
        return true;
    }

    if (fromPosY === toPosY && fromPosX >= toPosX - 1 && fromPosX <= toPosX + 1)
    {
        return true;
    }

    return false;
}

function refillBoard() {

    var maxDonutsMissingFromCol = 0;

    for (var i = 0; i < BOARD_COLS; i++)
    {
        var donutsMissingFromCol = 0;

        for (var j = BOARD_ROWS - 1; j >= 0; j--)
        {
            var donut = getDonut(i, j);

            if (donut === null)
            {
                donutsMissingFromCol++;
                donut = donuts.getFirstDead();
                donut.reset(i * DONUT_SIZE_SPACED, -donutsMissingFromCol * DONUT_SIZE_SPACED);
                donut.dirty = true;
                var type = selectRandomType();
                donut.donutType = type;
                donut.children[0].loadTexture(donut.donutType.img);

                //randomizeDonutColor(donut);
                setDonutPos(donut, i, j);
                tweenDonutPos(donut, donut.posX, donut.posY, donutsMissingFromCol * 2);
            }
        }

        maxDonutsMissingFromCol = Math.max(maxDonutsMissingFromCol, donutsMissingFromCol);
    }

    game.time.events.add(maxDonutsMissingFromCol * 2 * 100, boardRefilled);

} //fills the empty spaces in board, must be used after donuts are dropped, or grid initialized

function dropDonuts() {

    var dropRowCountMax = 0;

    for (var i = 0; i < BOARD_COLS; i++)
    {
        var dropRowCount = 0;

        for (var j = BOARD_ROWS - 1; j >= 0; j--)
        {
            var donut = getDonut(i, j);

            if (donut === null)
            {
                dropRowCount++;
            }
            else if (dropRowCount > 0)
            {
                donut.dirty = true;
                setDonutPos(donut, donut.posX, donut.posY + dropRowCount);
                tweenDonutPos(donut, donut.posX, donut.posY, dropRowCount);
            }
        }

        dropRowCountMax = Math.max(dropRowCount, dropRowCountMax);
    }

    return dropRowCountMax;

}//check each donut for a space beneath it and drop them, go from down upwards? in the example, the thing counts the rows by itself per column


function killDonutRange(fromX, fromY, toX, toY) {

    fromX = Phaser.Math.clamp(fromX, 0, BOARD_COLS - 1);
    fromY = Phaser.Math.clamp(fromY , 0, BOARD_ROWS - 1);
    toX = Phaser.Math.clamp(toX, 0, BOARD_COLS - 1);
    toY = Phaser.Math.clamp(toY, 0, BOARD_ROWS - 1);

    for (var i = fromX; i <= toX; i++)
    {
        for (var j = fromY; j <= toY; j++)
        {
            var donut = getDonut(i, j);
            donut.kill();
        }
    }

}//set donut.alive to false.

function slideDonut(pointer, x, y) {

    // check if a selected donut should be moved and do it

    if (selectedDonut && pointer.isDown)
    {
        var cursorDonutPosX = getDonutPos((x-DONUT_SPACE_LEFT_MARGIN));///game.world.scale.x);
        var cursorDonutPosY = getDonutPos((y-DONUT_SPACE_TOP_MARGIN));///game.world.scale.y);

        if (checkIfDonutCanBeMovedHere(selectedDonutStartPos.x, selectedDonutStartPos.y, cursorDonutPosX, cursorDonutPosY))
        {
            if (cursorDonutPosX !== selectedDonut.posX || cursorDonutPosY !== selectedDonut.posY)
            {
                // move currently selected donut
                if (selectedDonutTween !== null)
                {
                    game.tweens.remove(selectedDonutTween);
                }

                selectedDonutTween = tweenDonutPos(selectedDonut, cursorDonutPosX, cursorDonutPosY);

                donuts.bringToTop(selectedDonut);

                // if we moved a donut to make way for the selected donut earlier, move it back into its starting position
                if (tempShiftedDonut !== null)
                {
                    tweenDonutPos(tempShiftedDonut, selectedDonut.posX , selectedDonut.posY);
                    swapDonutPosition(selectedDonut, tempShiftedDonut);
                }

                // when the player moves the selected donut, we need to swap the position of the selected donut with the donut currently in that position 
                tempShiftedDonut = getDonut(cursorDonutPosX, cursorDonutPosY);

                if (tempShiftedDonut === selectedDonut)
                {
                    tempShiftedDonut = null;
                }
                else
                {
                    tweenDonutPos(tempShiftedDonut, selectedDonut.posX, selectedDonut.posY);
                    swapDonutPosition(selectedDonut, tempShiftedDonut);
                }
            }
        }
    }
}
function removeKilledDonuts() {
    let addedScore = 0
    donuts.forEach(function(donut) {
        if (!donut.alive) {
            addedScore += 100;
            score_var.score += addedScore;
            //donut.children[0].centerX = donut.world.x;
            //donut.children[0].centerY = donut.world.y;
            //donut.children[0].start(true,4000,null,10);
            //game.time.events.add(2000, destroyEmitter, this);
            //emitter.start(true,4000,null,10);
            setDonutPos(donut, -1,-1);
        }
    });

}

function releaseDonut() {
    //if nothing was selected, forget it
    if (tempShiftedDonut === null) {
        selectedDonut = null;
        return;
    }

    //check for matches and remove them
    var canKill = checkAndKillDonutMatches(selectedDonut);
    canKill = checkAndKillDonutMatches(tempShiftedDonut) || canKill;

    if (!canKill) //a case where there are no matches == swap the donuts back to the original positions
    {
        var donut = selectedDonut;

        if (donut.posX !== selectedDonutStartPos.x || donut.posY !== selectedDonutStartPos.y)
        {
            if (selectedDonutTween !== null)
            {
                game.tweens.remove(selectedDonutTween); //clear animation
            }

            selectedDonutTween = tweenDonutPos(donut, selectedDonutStartPos.x, selectedDonutStartPos.y);

            if (tempShiftedDonut !== null)
            {
                tweenDonutPos(tempShiftedDonut, donut.posX, donut.posY); //
            }

            swapDonutPosition(donut, tempShiftedDonut); //swap them back

            tempShiftedDonut = null;

        }
    }

    removeKilledDonuts();

    var dropDonutDuration = dropDonuts();

    // delay board refilling until all existing Donuts have dropped down
    game.time.events.add(dropDonutDuration * 100, refillBoard);

    allowInput = false;

    selectedDonut = null;
    tempShiftedDonut = null;

} // upon button release'

function swapDonutPosition(donut1, donut2) {

    var tempPosX = donut1.posX;
    var tempPosY = donut1.posY;
    setDonutPos(donut1, donut2.posX, donut2.posY);
    setDonutPos(donut2, tempPosX, tempPosY);

}

function boardRefilled() {
    var canKill = false;
    for (var i = 0; i < BOARD_COLS; i++)
    {
        for (var j = BOARD_ROWS - 1; j >= 0; j--) //so, this checks the entire board.
        {
            var donut = getDonut(i, j);

            if (donut.dirty)
            {
                donut.dirty = false;
                canKill = checkAndKillDonutMatches(donut) || canKill;
            }
        }
    }

    if(canKill){
        removeKilledDonuts();
        var dropDonutDuration = dropDonuts();
        // delay board refilling until all existing donuts have dropped down
        game.time.events.add(dropDonutDuration * 100, refillBoard);
        allowInput = false;
    } else {
        allowInput = true;
    }
}
//BONUS functions

function removeRow() {} //for bonus donuts

function removeColumn() {} //for bonus donuts

function addTimer() {} //another bonus donut

function multiplyScore() {} //another bonus, should eat the destroy-score

function timerTick() {
    //timer -= 1;
    if(timer == 0) {
        gameOver();
    }
    else { timer -= 1;
    game.time.events.add(1000,timerTick,this);
    }
}

function updateScoreBoard() {
    //First, make the scoreboard
    if(typeof score_text != 'undefined') score_text.text = '' + score_var.score;
    //score.text
}

function resizeGame() {
game.width = width;
game.height = height;
game.stage.width = width;
game.stage.height = height;
if (game.renderType === Phaser.WEBGL) {    
    game.renderer.resize(width, height);
}
game.world.setBounds(0, 0, width, height);
game.camera.setSize(width, height);
game.camera.setBoundsToWorld();
game.scale.setShowAll();
game.scale.refresh();
}


function gameOver() {
    allowInput = false;
    var timesupSprite = game.add.sprite(game.world.centerX, game.world.centerY*2 + 500, 'timeup');
    timesupSprite.anchor.x = 0.5;
    timesupSprite.anchor.y = 0.5;

    tutween = game.add.tween(timesupSprite);


    tutween.to({y:game.world.centerY},1000,'Linear',true,0);

    game.time.events.add(5000,toMenu,this);
}