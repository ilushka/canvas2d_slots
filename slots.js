var x = 10;
var y = -200;
var speed;
var period;         // In slots
var speedReduce;
var slowDownPeriod; // In slots
var slowDownConstant;
var stopDelaySetting;  // In slots

var canvas;
var canvasWidth;
var ctx;
var slotMachine = null;
var interval;

var ANIM_STATE_DRAW_STOP    = 0;
var ANIM_STATE_DRAW_START   = 1;
var ANIM_STATE_SLOW_DOWN    = 2;
var ANIM_STATE_BOUNCE       = 3;
var animState = ANIM_STATE_DRAW_STOP;

function log(txt) {
    if (true) {
        var txtNode = document.createTextNode(txt);
        var br = document.createElement('br');
        var logDiv = document.getElementById('log');
        logDiv.appendChild(txtNode);
        logDiv.appendChild(br);
    }
}

function SlotMachine(config) {
    this.reelCount = 0;
    this.slotCount = 0;
//    this.isReelSpinning = new Array();
    this.stopReel = -1;
    this.slotImages = new Array();
    this.nextSlot = 0;
    this.slotSize = 200;
    this.getNextSlot = function() {
        var slot = this.slotImages[this.nextSlot];
        this.nextSlot = (this.nextSlot + 1) % this.slotCount;
        return slot;
    }
    this.shiftReel = function() {
        this.nextSlot--;
        if (this.nextSlot < 0) {
            this.nextSlot = this.slotCount - 1;
        }
    }
    this.spin = function() {
        this.stopReel = -1;
    }

    // Initialization:

    if (config.hasOwnProperty('reelCount'))
        this.reelCount = config.reelCount;
    if (config.hasOwnProperty('slotCount'))
        this.slotCount = config.slotCount;

    for (var ii = 0; ii < config.slotImages.length; ++ii) {
        this.slotImages[ii] = new Image();
        this.slotImages[ii].src = config.slotImages[ii];
    }
}

var stopDelay;
function slotPassed() {
    // "Top" slot has been drawn:
    // - Push next slot from top

    slotMachine.shiftReel();

    --period;

    if (period < (slowDownPeriod - slotMachine.reelCount)) {
        if (stopDelay-- == 0) {
            draw(); // TODO: Decouple draw() from generateNextXY()
            slotMachine.stopReel++;        
            stopDelay = stopDelaySetting;
        }
    }

    if (period == slowDownPeriod) {
        slowTick = 1;
        animState = ANIM_STATE_SLOW_DOWN;
    } else if (period == 0) {
        animState = ANIM_STATE_DRAW_STOP;
    }
}

var slowTick;
function animateSlowDown() {
    slowTick += 1;
    var newSpeed = speed * (1 / Math.pow(Math.E, (slowTick / slowDownConstant)));
    if (newSpeed < 4)
        newSpeed = 4;
    y += newSpeed;
    log('speed: ' + newSpeed);
}

function animateBounce() {
    animState = ANIM_STATE_DRAW_STOP;
}

function animateSpin() {
    y += speed;
    
}

function generateNextXY() {
    switch (animState) {
        case ANIM_STATE_DRAW_START: 
            animateSpin();
            break;
        case ANIM_STATE_SLOW_DOWN:
            animateSlowDown();
            break;
    }

    if (y >= 0) {
        y = -200;
        slotPassed();
    }
}

function draw() {
    for (var reel = 0; reel < slotMachine.reelCount; ++reel) {
        if (reel > slotMachine.stopReel) {
            for (var slot = 0; slot < slotMachine.slotCount; ++slot) {
                ctx.drawImage(slotMachine.getNextSlot(),
                    x + (reel * slotMachine.slotSize),
                    y + (slot * slotMachine.slotSize),
                    slotMachine.slotSize,
                    slotMachine.slotSize);
            } // for (var slot = 0; slot < slotMachine.slotCount; ++slot)
        } // if (slotMachine.reels[reel])
    } // for (var reel = 0; reel < slotMachine.reelCount; ++reel)
}

function tick() {
    draw();
    if (animState) {
        generateNextXY();
    } else {
        clearInterval(interval);
    }
}

function start() {
    clearInterval(interval);

    if (slotMachine == null) {
        canvas = document.getElementById('slots_canvas');
        var attrs = canvas.attributes;
        canvasWidth = parseInt(attrs.getNamedItem('height').textContent, 10);
        ctx = canvas.getContext('2d');

        var config = {
            reelCount: 6,
            slotCount: 10,
            slotImages: ['slot0.png', 'slot1.png', 'slot2.png', 'slot3.png', 'slot4.png', 'slot5.png', 'slot6.png', 'slot7.png', 'slot8.png', 'slot9.png']
        };
        slotMachine = new SlotMachine(config);
    }

    setSpeed();
    setPeriod();
    setSlowDownPeriod();
    setSlowDownConstant();
    setStopDelay();

    slotMachine.spin();
    animState = ANIM_STATE_DRAW_START;
    interval = setInterval(tick, 10);

    log('### spin start');
}

function setSpeed() {
    speed = parseInt(document.getElementById('speed').value, 10);
}

function setPeriod() {
    period = parseInt(document.getElementById('period').value, 10);
}

function setSlowDownPeriod() {
    slowDownPeriod = parseInt(document.getElementById('slow_down_period').value, 10);
}

function setSlowDownConstant() {
    slowDownConstant = parseInt(document.getElementById('slow_down_constant').value, 10);
    log('slowDownConstant: ' + slowDownConstant);
}

function setStopDelay() {
    stopDelaySetting = parseInt(document.getElementById('stop_delay').value, 10);
    stopDelay = 0; // No delay for 1st reel
}

