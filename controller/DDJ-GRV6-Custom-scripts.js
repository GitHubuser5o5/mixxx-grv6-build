/*
 * Pioneer DDJ-GRV6 controller script for the GRV6 skin.
 * Based on Jörg Beyer's DDJ-GRV6 mapping (https://github.com/joergbeyer/dj-controller, GPL-3.0).
 * Skin controls it talks to ([Skin],grv6_*, [GRV6],*) are listed in docs/skin-notes.md.
 */


var PioneerDDJGRV6 = {};


PioneerDDJGRV6.lights = {
    beatFx: {
        status: 0x94,
        data1: 0x47,
    },
    shiftBeatFx: {
        status: 0x94,
        data1: 0x43,
    },
    decks: []
};
// The F5 rotation knob returns one of these mapping. 
// This is an observation by experimenting with the knob.
// see fxSelectAbsolute()
PioneerDDJGRV6.fxTable = [
    0.038, // Pos 0
    0.115, // Pos 1
    0.192, // Pos 2
    0.269, // Pos 3
    0.346, // Pos 4
    0.423, // Pos 5
    0.500, // Pos 6
    0.577, // Pos 7
    0.654, // Pos 8
    0.731, // Pos 9
    0.808, // Pos 10
    0.885, // Pos 11
    0.962  // Pos 12
];

// Mapping: Hardware-Position -> Interne Mixxx-ID
// see fxSelectAbsolute()
PioneerDDJGRV6.effectIdTable = [
    "org.mixxx.effects.autopan",             // Pos 0:  AUTOPAN
    "org.mixxx.effects.tremolo",             // Pos 1:  TREMOLO
    "org.mixxx.effects.reverb",              // Pos 2:  REVERB
    "org.mixxx.effects.pitchshift",          // Pos 3:  PITCH SHIFT
    "org.mixxx.effects.parametriceq",        // Pos 4:  PARAM EQ
    "org.mixxx.effects.metronome",           // Pos 5:  METRONOME
    "org.mixxx.effects.loudnesscontour",     // Pos 6:  LOUDNESS
    "org.mixxx.effects.glitch",              // Pos 7:  GLITCH
    "org.mixxx.effects.biquadfullkilllowpassfilter", // Pos 8: FILTER
    "org.mixxx.effects.distortedflanger",    // Pos 9:  DISTORTION
    "org.mixxx.effects.biquadfullkillhighpassfilter", // Pos 10: HPF
    "org.mixxx.effects.bitcrusher",          // Pos 11: BITCRUSHER
    "org.mixxx.effects.echo"                 // Pos 12: ECHO
];

PioneerDDJGRV6.playBlinkTimers = {};
PioneerDDJGRV6.playBlinkStates = {};


// see beatSyncHandler()
PioneerDDJGRV6.syncTimers = {};
//
// Globales Objekt für Loop-Timer 
PioneerDDJGRV6.loopTimers = {};

for (var i = 0; i < 4; i++) {
    PioneerDDJGRV6.lights.decks[i] = {
        vuMeter: {
            status: 0xB0 + i, 
            data1: 0x02,
            levels: {
                off: 0x00,
                oneGreen: 0x26,     // Leuchtet 1 grünes Segment 
                twoGreens: 0x41,    // Leuchtet 2 grüne Segmente 
                orangeGreen: 0x57,  // 1 Orange + 2 Grüne 
                twoOranges: 0x65,   // 2 Oranges + 2 Grüne 
                redFull: 0x77       // Rot + 2 Oranges + 2 Grüne (Peak) 
            }
        },
        playPause: {
            status: 0x90 + i, // 0x90, 0x91, 0x92, 0x93
            data1: 0x0B,
        },
        shiftPlayPause: {
            status: 0x90 + i,
            data1: 0x47,
        },
        cue: {
            status: 0x90 + i,
            data1: 0x0C,
        },
        shiftCue: {
            status: 0x90 + i,
            data1: 0x48,
        },
    };
}
// Store timer IDs
PioneerDDJGRV6.timers = {};

// Jog wheel constants
PioneerDDJGRV6.vinylMode = true;
PioneerDDJGRV6.alpha = 1.0/8;
PioneerDDJGRV6.beta = PioneerDDJGRV6.alpha/32;

// Multiplier for fast seek through track using SHIFT+JOGWHEEL
PioneerDDJGRV6.fastSeekScale = 150;
PioneerDDJGRV6.bendScale = 0.25;
PioneerDDJGRV6.scratchIntervals = 6473;

PioneerDDJGRV6.tempoRanges = [0.06, 0.10, 0.16, 0.25];

PioneerDDJGRV6.shiftButtonDown = [false, false];

// Jog wheel loop adjust - 4 channels
PioneerDDJGRV6.loopAdjustIn = [false, false, false, false];
PioneerDDJGRV6.loopAdjustOut = [false, false, false, false];
PioneerDDJGRV6.loopAdjustMultiply = 50;

// Beatjump pad (beatjump_size values)
PioneerDDJGRV6.beatjumpSizeForPad = {
    0x20: -1, // PAD 1
    0x21: 1,  // PAD 2
    0x22: -2, // PAD 3
    0x23: 2,  // PAD 4
    0x24: -4, // PAD 5
    0x25: 4,  // PAD 6
    0x26: -8, // PAD 7
    0x27: 8   // PAD 8
};

PioneerDDJGRV6.quickJumpSize = 32;

// Used for tempo slider
PioneerDDJGRV6.highResMSB = {
    "[Channel1]": {},
    "[Channel2]": {},
    "[Channel3]": {},
    "[Channel4]": {}
};

PioneerDDJGRV6.trackLoadedLED = function(value, group, _control) {
    midi.sendShortMsg(
        0x9F,
        group.match(script.channelRegEx)[1] - 1,
        value > 0 ? 0x7F : 0x00
    );
};

PioneerDDJGRV6.toggleLight = function(midiIn, active) {
    midi.sendShortMsg(midiIn.status, midiIn.data1, active ? 0x7F : 0);
};

PioneerDDJGRV6.LightOff = function() {
    for (var i = 0; i < 4; i++) {
        // buffered (screen rate) instead of every audio callback; vuMeterUpdate only sends changes
        engine.makeConnection("[Channel"+(i+1)+"]", "vu_meter", PioneerDDJGRV6.vuMeterUpdate);
        midi.sendShortMsg(PioneerDDJGRV6.lights.decks[i].vuMeter.status, 0x02, 0x00);

        // switch headphone (CUE) indicator off
        midi.sendShortMsg(0x90 + i, 0x54, 0x00);

        // beat sync LED off
        midi.sendShortMsg(0x90 + i, 0x58, 0x00);
    }

    // housekeeping
    // turn off all Sampler LEDs
    for (var i = 0; i <= 7; ++i) {
        midi.sendShortMsg(0x97, 0x30 + i, 0x00);    // Deck 1 pads
        midi.sendShortMsg(0x98, 0x30 + i, 0x00);    // Deck 1 pads with SHIFT
        midi.sendShortMsg(0x99, 0x30 + i, 0x00);    // Deck 2 pads  
        midi.sendShortMsg(0x9A, 0x30 + i, 0x00);    // Deck 2 pads with SHIFT
    }
    // turn off all Hotcue LEDs
    for (var i = 0; i <= 7; ++i) {
        midi.sendShortMsg(0x97, 0x00 + i, 0x00);    // Deck 1 pads
        midi.sendShortMsg(0x98, 0x00 + i, 0x00);    // Deck 1 pads with SHIFT
        midi.sendShortMsg(0x99, 0x00 + i, 0x00);    // Deck 2 pads
        midi.sendShortMsg(0x9A, 0x00 + i, 0x00);    // Deck 2 pads with SHIFT
    }

    // turn off loop in and out lights
    PioneerDDJGRV6.setLoopButtonLights(0x90, 0x00);
    PioneerDDJGRV6.setLoopButtonLights(0x91, 0x00);

    // turn off reloop lights
    PioneerDDJGRV6.setReloopLight(0x90, 0x00);
    PioneerDDJGRV6.setReloopLight(0x91, 0x00);

    // stop any flashing lights
    PioneerDDJGRV6.toggleLight(PioneerDDJGRV6.lights.beatFx, false);
    PioneerDDJGRV6.toggleLight(PioneerDDJGRV6.lights.shiftBeatFx, false);
}

PioneerDDJGRV6.initFx = function() {
    console.log("Pioneer DDJ-GRV6: initFx start");
    var unit = "[EffectRack1_EffectUnit1]";

    engine.setValue("[EffectRack1_EffectUnit1]", "group_[Channel1]_enable", 1);
    engine.setValue("[EffectRack1_EffectUnit1_Effect1]", "effect_selector", 0.115);
    engine.setValue("[EffectRack1_EffectUnit1_Effect1]", "enabled", 1);

    console.log("Pioneer DDJ-GRV6: initFx end");
};


PioneerDDJGRV6.init = function() {
    console.log("Pioneer DDJ-GRV6: init() starting...");

    engine.softTakeover("[Channel1]", "rate", true);
    engine.softTakeover("[Channel2]", "rate", true);
    engine.softTakeover("[Channel3]", "rate", true);
    engine.softTakeover("[Channel4]", "rate", true);
    engine.softTakeover("[EffectRack1_EffectUnit1_Effect1]", "meta", true);
    engine.softTakeover("[EffectRack1_EffectUnit1_Effect2]", "meta", true);
    engine.softTakeover("[EffectRack1_EffectUnit1_Effect3]", "meta", true);
    engine.softTakeover("[EffectRack1_EffectUnit1]", "mix", true);


    engine.setValue("[EffectRack1_EffectUnit1]", "show_focus", 1);
    engine.setValue("[Master]", "headMix", -1); // headphone cue/master blend is done by the controller hardware
    for (var c = 1; c <= 4; c++) {
        engine.makeConnection("[QuickEffectRack1_[Channel" + c + "]]", "enabled", PioneerDDJGRV6.cfxLed);
    }
    PioneerDDJGRV6.cfxLed();
    // safe trim at startup (about -6 dB); soft takeover picks up the real knob position
    for (var tc = 1; tc <= 4; tc++) {
        engine.setValue("[Channel" + tc + "]", "pregain", 1.0);
    }
    PioneerDDJGRV6.LightOff();

    // SAMPLER SETUP ---
    const samplerCount = 16;
    if (engine.getValue("[App]", "num_samplers") < samplerCount) {
        engine.setValue("[App]", "num_samplers", samplerCount);
    }
    for (var i = 1; i <= samplerCount; i++) {
        engine.makeConnection("[Sampler" + i + "]", "play", PioneerDDJGRV6.samplerPlayOutputCB);
    }

    for (var i = 1; i <= 4; i++) {
        var group = "[Channel" + i + "]";
        var deckIdx = i - 1;

        // Rate & LEDs
        engine.softTakeover(group, "rate", true);
        engine.makeConnection(group, "track_loaded", PioneerDDJGRV6.trackLoadedLED);
        engine.makeConnection(group, "play", PioneerDDJGRV6.playLEDHandler);
        engine.makeConnection(group, "playposition", PioneerDDJGRV6.jogWheelLED);
        engine.makeConnection(group, "loop_enabled", PioneerDDJGRV6.loopToggle);
        // Settings tab: LOAD (hardware or on-screen) stops the preview / leaves Browse
        engine.makeConnection(group, "LoadSelectedTrack", PioneerDDJGRV6.onLoadPress);

        // Hardware Resets (MIDI Status 0x90-0x93, 0xB0-0xB3)
        midi.sendShortMsg(0xB0 + deckIdx, 0x3F, 0x7F); // Brightness
        midi.sendShortMsg(0xB0 + deckIdx, 0x0C, 0x7F); // Alt Brightness
        
        // enforce initial-Status
        engine.trigger(group, "play");
        engine.trigger(group, "playposition");
        engine.trigger(group, "cue_default");
        engine.trigger(group, "vu_meter");
    }

    PioneerDDJGRV6.setLoopButtonLights(0x90, 0x7F);
    PioneerDDJGRV6.setLoopButtonLights(0x91, 0x7F);
    PioneerDDJGRV6.setLoopButtonLights(0x92, 0x7F);
    PioneerDDJGRV6.setLoopButtonLights(0x93, 0x7F);
    midi.sendShortMsg(0x9F, 0x00, 0x7F); // Startup Animation Deck 1
    midi.sendShortMsg(0x9F, 0x01, 0x7F); // Startup Animation Deck 2

    for (var i = 1; i <= 3; i++) {
        engine.makeConnection("[EffectRack1_EffectUnit1_Effect" + i +"]", "enabled", PioneerDDJGRV6.toggleFxLight);
    }
    engine.makeConnection("[EffectRack1_EffectUnit1]", "focused_effect", PioneerDDJGRV6.toggleFxLight);
    engine.makeConnection("[EffectRack1_EffectUnit1]", "enabled", PioneerDDJGRV6.updateFxLed);

    // TODO: 2x check
    midi.sendSysexMsg([0xF0, 0x00, 0x20, 0x7E, 0x03, 0x00, 0x00, 0x01, 0x00, 0x00, 0xF7]);
    midi.sendSysexMsg([0xF0, 0x00, 0x40, 0x05, 0x00, 0x00, 0x02, 0x06, 0x00, 0x03, 0x01, 0xF7], 12);

    PioneerDDJGRV6.updateFxLed(engine.getValue("[EffectRack1_EffectUnit1]", "enabled"));

    PioneerDDJGRV6.padsInit();
    PioneerDDJGRV6.initFx();
    PioneerDDJGRV6.startupDefaults();

    console.log("Pioneer DDJ-GRV6: init() done");
};


//
// Effects
//


PioneerDDJGRV6.focusedFxGroup = function() {
    var focusedFx = engine.getValue("[EffectRack1_EffectUnit1]", "focused_effect");
    // Falls 0 geliefert wird (kein Fokus), nehmen wir Slot 1 als Standard
    if (focusedFx < 1) {
        focusedFx = 1;
    }
    return "[EffectRack1_EffectUnit1_Effect" + focusedFx + "]";
};


//
// Loop IN/OUT ADJUST
//


PioneerDDJGRV6.toggleLoopAdjustOut = function(channel, _control, value, _status, group) {
    if (value === 0 || engine.getValue(group, "loop_enabled" === 0)) {
        return;
    }
    PioneerDDJGRV6.loopAdjustOut[channel] = !PioneerDDJGRV6.loopAdjustOut[channel];
    PioneerDDJGRV6.loopAdjustIn[channel] = false;
};

// Two signals are sent here so that the light stays lit/unlit in its shift state too
PioneerDDJGRV6.setReloopLight = function(status, value) {
    midi.sendShortMsg(status, 0x4D, value);
    midi.sendShortMsg(status, 0x50, value);
};


PioneerDDJGRV6.setLoopButtonLights = function(status, value) {
    [0x10, 0x11, 0x4E, 0x4C].forEach(function(control) {
        midi.sendShortMsg(status, control, value);
    });
};

PioneerDDJGRV6.startLoopLightsBlink = function(channel, control, status, group) {
    var blink = 0x7F;

    PioneerDDJGRV6.stopLoopLightsBlink(group, control, status);

    PioneerDDJGRV6.timers[group][control] = engine.beginTimer(500, () => {
        blink = 0x7F - blink;

        // When adjusting the loop out position, turn the loop in light off
        if (PioneerDDJGRV6.loopAdjustOut[channel]) {
            midi.sendShortMsg(status, 0x10, 0x00);
            midi.sendShortMsg(status, 0x4C, 0x00);
        } else {
            midi.sendShortMsg(status, 0x10, blink);
            midi.sendShortMsg(status, 0x4C, blink);
        }

        // When adjusting the loop in position, turn the loop out light off
        if (PioneerDDJGRV6.loopAdjustIn[channel]) {
            midi.sendShortMsg(status, 0x11, 0x00);
            midi.sendShortMsg(status, 0x4E, 0x00);
        } else {
            midi.sendShortMsg(status, 0x11, blink);
            midi.sendShortMsg(status, 0x4E, blink);
        }
    });

};

PioneerDDJGRV6.stopLoopLightsBlink = function(group, control, status) {
    PioneerDDJGRV6.timers[group] = PioneerDDJGRV6.timers[group] || {};

    if (PioneerDDJGRV6.timers[group][control] !== undefined) {
        engine.stopTimer(PioneerDDJGRV6.timers[group][control]);
    }
    PioneerDDJGRV6.timers[group][control] = undefined;
    PioneerDDJGRV6.setLoopButtonLights(status, 0x7F);
};

PioneerDDJGRV6.loopToggle = function(value, group, control) {
    // TODO: 4 channels
    const deckNumber = parseInt(group.match(/\d/)[0]),
        status = 0x90 + deckNumber - 1,
        channel = deckNumber - 1;

    PioneerDDJGRV6.setReloopLight(status, value ? 0x7F : 0x00);

    if (value) {
        PioneerDDJGRV6.startLoopLightsBlink(channel, control, status, group);
    } else {
        PioneerDDJGRV6.stopLoopLightsBlink(group, control, status);
        PioneerDDJGRV6.loopAdjustIn[channel] = false;
        PioneerDDJGRV6.loopAdjustOut[channel] = false;
    }
};


//
// Jog wheels
//

PioneerDDJGRV6.jogTurn = function(channel, _control, value, _status, group) {
    const deckNum = channel + 1;
    // wheel center at 64; <64 rew >64 fwd
    var newVal = value - 64;

    // loop_in / out adjust
    const loopEnabled = engine.getValue(group, "loop_enabled");
    if (loopEnabled > 0) {
        if (PioneerDDJGRV6.loopAdjustIn[channel]) {
            newVal = newVal * PioneerDDJGRV6.loopAdjustMultiply + engine.getValue(group, "loop_start_position");
            engine.setValue(group, "loop_start_position", newVal);
            return;
        }
        if (PioneerDDJGRV6.loopAdjustOut[channel]) {
            newVal = newVal * PioneerDDJGRV6.loopAdjustMultiply + engine.getValue(group, "loop_end_position");
            engine.setValue(group, "loop_end_position", newVal);
            return;
        }
    }

    if (engine.isScratching(deckNum)) {
        engine.scratchTick(deckNum, newVal);
    } else { // fallback
        engine.setValue(group, "jog", newVal * this.bendScale);
    }
};


PioneerDDJGRV6.jogSearch = function(_channel, _control, value, _status, group) {
    const newVal = (value - 64) * PioneerDDJGRV6.fastSeekScale;
    engine.setValue(group, "jog", newVal);
};

PioneerDDJGRV6.jogTouch = function(channel, _control, value) {
    const deckNum = channel + 1;

    // skip while adjusting the loop points
    if (PioneerDDJGRV6.loopAdjustIn[channel] || PioneerDDJGRV6.loopAdjustOut[channel]) {
        return;
    }

    if (value !== 0 && this.vinylMode) {
        engine.scratchEnable(deckNum, PioneerDDJGRV6.scratchIntervals, 33+1/3, this.alpha, this.beta);
    } else {
        engine.scratchDisable(deckNum);
    }
};

//
// Shift button
//

PioneerDDJGRV6.shiftPressed = function(channel, _control, value, _status, _group) {
    PioneerDDJGRV6.shiftButtonDown[channel] = value === 0x7F;
};


//
// Tempo sliders
//
// The tempo option in Mixxx's deck preferences determine whether down/up
// increases/decreases the rate. Therefore it must be inverted here so that the
// UI and the control sliders always move in the same direction.
//

PioneerDDJGRV6.tempoSliderMSB = function(channel, control, value, status, group) {
    PioneerDDJGRV6.highResMSB[group].tempoSlider = value;
};


PioneerDDJGRV6.samplerPlayOutputCB = function(value, group, _control) {
    if (value === 1) {
        const curPad = group.match(script.samplerRegEx)[1];
        PioneerDDJGRV6.startSamplerBlink(
            0x97 + (curPad > 8 ? 2 : 0),
            0x30 + ((curPad > 8 ? curPad - 8 : curPad) - 1),
            group);
    }
};


PioneerDDJGRV6.startSamplerBlink = function(channel, control, group) {
    var val = 0x7f;

    PioneerDDJGRV6.stopSamplerBlink(channel, control);
    PioneerDDJGRV6.timers[channel][control] = engine.beginTimer(250, () => {
        val = 0x7f - val;

        // blink the appropriate pad
        midi.sendShortMsg(channel, control, val);
        // also blink the pad while SHIFT is pressed
        midi.sendShortMsg((channel+1), control, val);

        const isPlaying = engine.getValue(group, "play") === 1;

        if (!isPlaying) {
            // kill timer
            PioneerDDJGRV6.stopSamplerBlink(channel, control);
            // set the pad LED to ON
            midi.sendShortMsg(channel, control, 0x7f);
            // set the pad LED to ON while SHIFT is pressed
            midi.sendShortMsg((channel+1), control, 0x7f);
        }
    });
};

PioneerDDJGRV6.stopSamplerBlink = function(channel, control) {
    PioneerDDJGRV6.timers[channel] = PioneerDDJGRV6.timers[channel] || {};

    if (PioneerDDJGRV6.timers[channel][control] !== undefined) {
        engine.stopTimer(PioneerDDJGRV6.timers[channel][control]);
        PioneerDDJGRV6.timers[channel][control] = undefined;
    }
};


PioneerDDJGRV6.lastJogPos = [-1, -1, -1, -1];

PioneerDDJGRV6.jogWheelLED = function (value, group, control) {
    var m = group.match(/^\[Channel(\d)\]$/);
    if (!m) return;
    var deckIdx = parseInt(m[1]) - 1;

    var duration = engine.getValue(group, "duration");
    if (duration <= 0) return;

    var secondsPerRotation = 60 / 33.33;
    var elapsedTime = value * duration;
    var rawPos = (elapsedTime % secondsPerRotation) / secondsPerRotation;
    var ledPos = Math.min(0x48, Math.floor(rawPos * 73));

    if (PioneerDDJGRV6.lastJogPos[deckIdx] !== ledPos) {
        midi.sendShortMsg(0xBF, deckIdx, ledPos);
        PioneerDDJGRV6.lastJogPos[deckIdx] = ledPos;
    }
};


// F6: route the channel
PioneerDDJGRV6.fxChannelSelect = function (channel, control, value, status, group) {
    if (value === 0) return 0; // ifnore the "off" note

    var midiToTarget = {
        0x10: "[Channel1]",
        0x11: "[Channel2]",
        0x12: "[Channel3]",
        0x13: "[Channel4]",
        0x14: "[Master]",
        0x16: "[Samplers]", // "SP" key in the F6 block of keys.
    };

    var targetDeck = midiToTarget[control];
    if (targetDeck) {
        var allTargets = ["[Channel1]", "[Channel2]", "[Channel3]", "[Channel4]", "[Master]", "[Samplers]"];
        
        // switch the targets correct: all to "off" except the one for "targetDeck"
        for (var i = 0; i < allTargets.length; i++) {
            var parameterName = "group_" + allTargets[i] + "_enable";
            var shouldBeEnabled = (targetDeck === allTargets[i]) ? 1 : 0;
            engine.setParameter(group, parameterName, shouldBeEnabled);
        }
        
        print("F6 CH SELECT: Routing zu " + targetDeck + " aktiviert.");
    }
};


PioneerDDJGRV6.updateFxLed = function (value) {
    var status = 0x94; 
    var midino = 0x47; 
    
    if (value > 0) {
        midi.sendShortMsg(status, midino, 0x7F); // Ganz hell
    } else {
        // send: off
        midi.sendShortMsg(status, midino, 0x00);
        // fallback. TODO: is this required?
        midi.sendShortMsg(0x84, midino, 0x00); 
    }
};


PioneerDDJGRV6.f7_msb = 0;
PioneerDDJGRV6.f7_lsb = 0;


// Funktion für den ON/OFF Button (F8)

PioneerDDJGRV6.playLEDHandler = function (value, group, control) {
    var deckNum = parseInt(group.substring(8, 9)) - 1;
    var status = 0x90 + deckNum;
    var midino = 0x0B; // D22 Taste

    if (value > 0) {
        // --- constant on: song is playing
        if (PioneerDDJGRV6.playBlinkTimers[group]) {
            engine.stopTimer(PioneerDDJGRV6.playBlinkTimers[group]);
            PioneerDDJGRV6.playBlinkTimers[group] = null;
        }
        midi.sendShortMsg(status, midino, 0x7F); // Dauer-An
    } else {
        // just blink, even when a track is loaded
        if (engine.getValue(group, "track_loaded")) {
            if (!PioneerDDJGRV6.playBlinkTimers[group]) {
                PioneerDDJGRV6.playBlinkStates[group] = false;
                PioneerDDJGRV6.playBlinkTimers[group] = engine.beginTimer(500, function() {
                    PioneerDDJGRV6.playBlinkStates[group] = !PioneerDDJGRV6.playBlinkStates[group];
                    var ledVal = PioneerDDJGRV6.playBlinkStates[group] ? 0x7F : 0x00;
                    midi.sendShortMsg(status, midino, ledVal);
                });
            }
        } else {
            // no track loaded: LED to off
            if (PioneerDDJGRV6.playBlinkTimers[group]) {
                engine.stopTimer(PioneerDDJGRV6.playBlinkTimers[group]);
                PioneerDDJGRV6.playBlinkTimers[group] = null;
            }
            midi.sendShortMsg(status, midino, 0x00);
        }
    }
};


PioneerDDJGRV6.shutdown = function() {
    // reset vumeter
    PioneerDDJGRV6.LightOff();
};

//
// CFX button: on/off and switch quick effect (custom)
//
PioneerDDJGRV6.cfxGroups = [
    "[QuickEffectRack1_[Channel1]]",
    "[QuickEffectRack1_[Channel2]]",
    "[QuickEffectRack1_[Channel3]]",
    "[QuickEffectRack1_[Channel4]]"
];

PioneerDDJGRV6.cfxAnyEnabled = function () {
    for (var i = 0; i < PioneerDDJGRV6.cfxGroups.length; i++) {
        if (engine.getValue(PioneerDDJGRV6.cfxGroups[i], "enabled") > 0) return true;
    }
    return false;
};

PioneerDDJGRV6.cfxLed = function () {
    midi.sendShortMsg(0x96, 0x00, PioneerDDJGRV6.cfxAnyEnabled() ? 0x7F : 0x00);
};

PioneerDDJGRV6.cfxToggle = function (channel, control, value, status, group) {
    if (value === 0) return;
    var target = PioneerDDJGRV6.cfxAnyEnabled() ? 0 : 1;
    for (var i = 0; i < PioneerDDJGRV6.cfxGroups.length; i++) {
        engine.setValue(PioneerDDJGRV6.cfxGroups[i], "enabled", target);
    }
};

PioneerDDJGRV6.cfxSwitch = function (channel, control, value, status, group) {
    if (value === 0) return;
    for (var i = 0; i < PioneerDDJGRV6.cfxGroups.length; i++) {
        var g = PioneerDDJGRV6.cfxGroups[i];
        engine.setValue(g, "next_chain_preset", 1);
        engine.setValue(g, "next_chain_preset", 0);
        if (engine.getValue(g, "loaded_chain_preset") === 0) {
            engine.setValue(g, "next_chain_preset", 1);
            engine.setValue(g, "next_chain_preset", 0);
        }
    }
};


//
// Performance pads, round A (custom)
//
PioneerDDJGRV6.padsInit = function () {
    // beat jump pads have no state: keep them lit
    var padChannels = [0x97, 0x99, 0x9B, 0x9D];
    for (var i = 0; i < 4; i++) {
        for (var n = 0; n < 8; n++) {
            midi.sendShortMsg(padChannels[i], 0x20 + n, 0x7F);
        }
    }
};

PioneerDDJGRV6.samplerStop = function (channel, control, value, status, group) {
    if (value === 0) return;
    engine.setValue(group, "play", 0);
};


//
// Round B (custom)
//
PioneerDDJGRV6.rateRanges = [0.06, 0.10, 0.16, 0.50];

PioneerDDJGRV6.startupDefaults = function () {
    var unit = "[EffectRack1_EffectUnit1]";
    // Beat FX starts off, LED off
    engine.setValue(unit, "enabled", 0);
    PioneerDDJGRV6.updateFxLed(0);

    for (let d = 1; d <= 4; d++) {
        const g = "[Channel" + d + "]";
        engine.setValue(g, "volume", 0);          // faders start at zero
        // quantize and tempo range at startup: Settings tab > STARTUP DEFAULTS (stable 3 build,
        // [GRV6],startup_quantize / startup_tempo, applied by Mixxx itself after the skin loads)
        engine.setValue(PioneerDDJGRV6.cfxGroups[d - 1], "enabled", 1);   // CFX off

        // Key Sync LED follows the key shift
        engine.makeConnection(g, "pitch_adjust", PioneerDDJGRV6.keySyncLed);
        engine.trigger(g, "pitch_adjust");

        // Key Shift pad LEDs follow the key shift too (see keyShiftLed below)
        engine.makeConnection(g, "pitch_adjust", PioneerDDJGRV6.keyShiftLed);
        engine.trigger(g, "pitch_adjust");
    }
    PioneerDDJGRV6.cfxLed();

    // main gain at unity so the controller's master knob is the real master
    engine.setValue("[Master]", "gain", 1.0);

    PioneerDDJGRV6.padsInit2();
    PioneerDDJGRV6.roundCInit();
    PioneerDDJGRV6.roundDInit();
    PioneerDDJGRV6.roundEInit();
    PioneerDDJGRV6.fxBeatStart();
    PioneerDDJGRV6.fxSwitchOnSlots();
    PioneerDDJGRV6.roundLInit();
};

// beat jump pads have no state: keep them lit on the Shift layer too
PioneerDDJGRV6.padsInit2 = function () {
    var shiftChannels = [0x98, 0x9A, 0x9C, 0x9E];
    for (var i = 0; i < 4; i++) {
        for (var n = 0; n < 8; n++) {
            midi.sendShortMsg(shiftChannels[i], 0x20 + n, 0x7F);
        }
    }
};

PioneerDDJGRV6.keySyncLed = function (value, group) {
    var deck = parseInt(group.match(/\d/)[0]);
    var v = Math.abs(value) > 0.001 ? 0x7F : 0x00;
    midi.sendShortMsg(0x90 + deck - 1, 0x65, v);
    midi.sendShortMsg(0x90 + deck - 1, 0x64, v);
};

// Key Shift pad LEDs: pads 0-6 (midino 0x70-0x76, status 0x97/0x99/0x9B/0x9D per deck)
// are keyShiftSemitones[-3..+3]; the pad for the CURRENT pitch_adjust value flashes
// (same 250ms on/off blink as startSamplerBlink), all others go dark, and pad index 3
// (semitone 0, "normal pitch") is always lit solid so it stands out from the flashing
// one even when it is not itself the active shift. Note: this mapping has no confirmed
// RGB pad LED support anywhere (every other pad LED here is plain on/off) - the "0" pad
// is lit steady, not deliberately colored blue. If it does show as a distinct color,
// that is this pad slot's own hardware default, not something this script sets.
PioneerDDJGRV6.keyShiftLed = function (value, group) {
    var deck = parseInt(group.match(/\d/)[0]);
    var status = 0x97 + (deck - 1) * 2;

    PioneerDDJGRV6.stopSamplerBlink(status, 0x78);
    // n 0-6 are the shift-amount pads (0x70-0x76); n 7 (0x77) is the second
    // reset-to-normal-pitch pad - both 3 and 7 stay lit solid like the reset action they are.
    for (var n = 0; n <= 7; n++) {
        midi.sendShortMsg(status, 0x70 + n, (n === 3 || n === 7) ? 0x7F : 0x00);
    }

    var idx = PioneerDDJGRV6.keyShiftSemitones.indexOf(value);
    if (idx >= 0 && idx !== 3) {
        var on = 0x00;
        PioneerDDJGRV6.timers[status] = PioneerDDJGRV6.timers[status] || {};
        PioneerDDJGRV6.timers[status][0x78] = engine.beginTimer(250, () => {
            on = 0x7F - on;
            midi.sendShortMsg(status, 0x70 + idx, on);
        });
    }
};

// Slip: hold to keep it on, release turns it off
PioneerDDJGRV6.slipHold = function (channel, control, value, status, group) {
    engine.setValue(group, "slip_enabled", value > 0 ? 1 : 0);
};

// Shift+Master Tempo: cycle the tempo range
PioneerDDJGRV6.tempoRangeCycle = function (channel, control, value, status, group) {
    if (value === 0) return;
    var cur = engine.getValue(group, "rateRange");
    var idx = 0;
    for (var i = 0; i < PioneerDDJGRV6.rateRanges.length; i++) {
        if (Math.abs(PioneerDDJGRV6.rateRanges[i] - cur) < 0.005) idx = i;
    }
    engine.setValue(group, "rateRange", PioneerDDJGRV6.rateRanges[(idx + 1) % PioneerDDJGRV6.rateRanges.length]);
};

// Beat FX: one LED source (the unit), on/off toggles the unit only,
// the depth knob only sets dry/wet and never switches anything on
PioneerDDJGRV6.toggleFxLight = function () {
    PioneerDDJGRV6.updateFxLed(engine.getValue("[EffectRack1_EffectUnit1]", "enabled"));
};


//
// Round C (custom)
//
// Volume levels the software is held at. 1.0 = unity = the loudest CLEAN level.
// Values above 1.0 boost the signal digitally and can clip.
PioneerDDJGRV6.mainGain = 1.0;
PioneerDDJGRV6.headphoneGain = 1.0;

PioneerDDJGRV6.syncPending = [false, false, false, false];   // LED lit: synced, fader not matched yet
PioneerDDJGRV6.pickup = [false, false, false, false];        // ignore the tempo fader until it matches
PioneerDDJGRV6.faderRate = [undefined, undefined, undefined, undefined];

PioneerDDJGRV6.roundCInit = function () {
    engine.setValue("[Master]", "gain", PioneerDDJGRV6.mainGain);
    engine.setValue("[Master]", "headGain", PioneerDDJGRV6.headphoneGain);

    for (let d = 1; d <= 4; d++) {
        const g = "[Channel" + d + "]";
        engine.makeConnection(g, "sync_enabled", () => PioneerDDJGRV6.syncLed(g));
        engine.makeConnection(g, "sync_mode", () => PioneerDDJGRV6.syncLed(g));
        PioneerDDJGRV6.syncLed(g);
    }

    // pad modes without state keep their pads lit (Keyboard, Pad FX, Key Shift), normal + Shift layer
    var chans = [0x97, 0x99, 0x9B, 0x9D, 0x98, 0x9A, 0x9C, 0x9E];
    for (var i = 0; i < chans.length; i++) {
        for (var n = 0; n < 8; n++) {
            midi.sendShortMsg(chans[i], 0x40 + n, 0x7F);
            midi.sendShortMsg(chans[i], 0x50 + n, 0x7F);
            midi.sendShortMsg(chans[i], 0x70 + n, 0x7F);
        }
    }
};


// Beat Sync LED (note 0x58) and leader LED on the Shift layer (note 0x5C)
PioneerDDJGRV6.syncLed = function (group) {
    const deck = parseInt(group.match(/\d/)[0]);
    const lit = engine.getValue(group, "sync_enabled") > 0 || PioneerDDJGRV6.syncPending[deck - 1];
    midi.sendShortMsg(0x90 + deck - 1, 0x58, lit ? 0x7F : 0x00);
    const leader = engine.getValue(group, "sync_mode") === 2;
    midi.sendShortMsg(0x90 + deck - 1, 0x5C, leader ? 0x7F : 0x00);
};

// Beat Sync button: short press = one-shot sync (or switch sync lock off), long press = sync lock
PioneerDDJGRV6.beatSyncHandler = function (channel, control, value, status, group) {
    const deck = parseInt(group.match(/\d/)[0]);
    if (value > 0) {
        PioneerDDJGRV6.syncTimers[group] = engine.beginTimer(300, function () {
            PioneerDDJGRV6.syncTimers[group] = 0;
            engine.setValue(group, "sync_enabled", 1);
            PioneerDDJGRV6.syncPending[deck - 1] = true;
            PioneerDDJGRV6.pickup[deck - 1] = true;
            PioneerDDJGRV6.syncLed(group);
        }, true);
    } else if (PioneerDDJGRV6.syncTimers[group]) {
        engine.stopTimer(PioneerDDJGRV6.syncTimers[group]);
        PioneerDDJGRV6.syncTimers[group] = 0;
        if (engine.getValue(group, "sync_enabled") > 0) {
            engine.setValue(group, "sync_enabled", 0);
            PioneerDDJGRV6.syncPending[deck - 1] = false;
            PioneerDDJGRV6.pickup[deck - 1] = true;    // keep the tempo until the fader matches again
        } else {
            script.triggerControl(group, "beatsync", 50);
            PioneerDDJGRV6.syncPending[deck - 1] = true;
            PioneerDDJGRV6.pickup[deck - 1] = true;
        }
        PioneerDDJGRV6.syncLed(group);
    }
};

// Tempo fader with pickup: while synced, ignore the fader until it reaches the synced tempo
//
// Center deadzone (custom): the 14-bit fader rarely lands on the exact digital center value
// (0x2000/2 = 4096) at its physical center - on this hardware it is off by a tick or two per
// deck (confirmed: deck 4 reads +0.01%/-9.99%/+10.01% across its whole travel, a constant
// one-tick offset). Below keylock that residual "rate" is not just cosmetic: [ChannelN],pitch
// is computed live from rate when keylock is off, so a "0.00%"-looking-but-not-quite-zero
// rate was making the skin's transposed-key block (KeyShiftBox, bound to pitch != 0) show up
// on a track nobody pitched. |faderRate| < 0.0005 (about 4 ticks, ~0.05%) is snapped to a
// clean 0 - small enough that no deliberate beatmatch nudge is ever mistaken for "centered".
// This does not touch the fader's end-of-travel range (a different, separate calibration
// issue - reported separately for deck 2 not quite reaching +-10%).
PioneerDDJGRV6.tempoSliderLSB = function (channel, control, value, status, group) {
    const idx = parseInt(group.match(/\d/)[0]) - 1;
    const fullValue = (PioneerDDJGRV6.highResMSB[group].tempoSlider << 7) + value;
    const rawFaderRate = 1 - (fullValue / 0x2000);
    const faderRate = Math.abs(rawFaderRate) < 0.0005 ? 0 : rawFaderRate;
    const prev = PioneerDDJGRV6.faderRate[idx];
    PioneerDDJGRV6.faderRate[idx] = faderRate;

    if (PioneerDDJGRV6.pickup[idx]) {
        const rate = engine.getValue(group, "rate");
        const crossed = prev !== undefined && ((prev - rate) * (faderRate - rate) <= 0);
        if (Math.abs(faderRate - rate) < 0.004 || crossed) {
            PioneerDDJGRV6.pickup[idx] = false;
            if (PioneerDDJGRV6.syncPending[idx]) {
                PioneerDDJGRV6.syncPending[idx] = false;
                // a follower drops out of sync; a leader keeps the clock and now follows the fader
                if (engine.getValue(group, "sync_enabled") > 0 && engine.getValue(group, "sync_mode") !== 2) {
                    engine.setValue(group, "sync_enabled", 0);
                }
            }
            engine.setValue(group, "rate", faderRate);
            PioneerDDJGRV6.syncLed(group);
        }
        return;
    }
    engine.setValue(group, "rate", faderRate);
};

// Key Sync: press = sync key; press again while the key is shifted = reset. Shift+Key Sync always resets
PioneerDDJGRV6.keySyncPress = function (channel, control, value, status, group) {
    if (value === 0) return;
    if (Math.abs(engine.getValue(group, "pitch_adjust")) > 0.001) {
        PioneerDDJGRV6.keyReset(channel, control, value, status, group);
    } else {
        script.triggerControl(group, "sync_key", 50);
    }
};

PioneerDDJGRV6.keyReset = function (channel, control, value, status, group) {
    if (value === 0) return;
    script.triggerControl(group, "reset_key", 50);
    engine.setValue(group, "pitch_adjust", 0);
};

// Keyboard mode: play hot cue 1 at a different pitch while the pad is held (Mixxx allows +-3 semitones)
PioneerDDJGRV6.keyboardSemitones = [-3, -2, -1, 0, 1, 2, 3];

// Key Shift mode: pads 1-7 set the key shift (-3 .. +3, pad 4 = 0/normal pitch), pad 8 is a
// second reset-to-normal-pitch button (was sync key - removed, see keyShiftPad); Shift+pad resets
PioneerDDJGRV6.keyShiftSemitones = [-3, -2, -1, 0, 1, 2, 3];
PioneerDDJGRV6.keyShiftPad = function (channel, control, value, status, group) {
    if (value === 0) return;
    const n = control & 0x0F;
    if (n === 7) {
        // Second reset-to-normal-pitch button (pad 4/index 3 already does this too) -
        // was sync_key, removed: no dedicated pad should silently sync to another deck.
        engine.setValue(group, "pitch_adjust", 0);
        return;
    }
    engine.setValue(group, "pitch_adjust", PioneerDDJGRV6.keyShiftSemitones[n]);
};


//
// Round D (custom)
//
PioneerDDJGRV6.vuScale = 118;   // higher = LEDs react more

PioneerDDJGRV6.roundDInit = function () {
    // Beat FX starts routed to the master, and remembers which chain preset is loaded
    PioneerDDJGRV6.fxRoute("[Master]");
    PioneerDDJGRV6.fxPos = engine.getValue("[EffectRack1_EffectUnit1]", "loaded_chain_preset");
    PioneerDDJGRV6.fxPosTime = 0;

    // channel LEDs go red when the software peak lamp lights
    for (let d = 1; d <= 4; d++) {
        const g = "[Channel" + d + "]";
        engine.makeConnection(g, "PeakIndicator",
            () => PioneerDDJGRV6.vuMeterUpdate(engine.getValue(g, "vu_meter"), g));
    }
};

// Channel level LEDs: red only when clipping, otherwise scaled up to the top orange
PioneerDDJGRV6.lastVu = [-1, -1, -1, -1];
PioneerDDJGRV6.vuMeterUpdate = function (value, group) {
    const deck = parseInt(group.match(/\d/)[0]);
    const clipping = engine.getValue(group, "PeakIndicator") > 0;
    const v = clipping ? 127 : Math.min(118, Math.round(value * PioneerDDJGRV6.vuScale));
    if (PioneerDDJGRV6.lastVu[deck - 1] === v) {
        return; // the LED shows this already: no MIDI message
    }
    PioneerDDJGRV6.lastVu[deck - 1] = v;
    midi.sendShortMsg(0xB0 + deck - 1, 0x02, v);
};

// Shift+Load: eject the deck, never while it is playing
PioneerDDJGRV6.ejectDeck = function (channel, control, value, status, group) {
    if (value === 0) return;
    if (engine.getValue(group, "play") > 0) return;
    script.triggerControl(group, "eject", 50);
};


// ---- Beat FX strip ----
// route the effect unit to exactly one target (a deck, the master, or all samplers)
PioneerDDJGRV6.fxRoute = function (pick) {
    var unit = "[EffectRack1_EffectUnit1]";
    var all = ["[Channel1]", "[Channel2]", "[Channel3]", "[Channel4]", "[Master]"];
    for (var i = 1; i <= 16; i++) all.push("[Sampler" + i + "]");
    for (var j = 0; j < all.length; j++) {
        var on = (all[j] === pick) || (pick === "SAMPLERS" && all[j].indexOf("[Sampler") === 0);
        engine.setValue(unit, "group_" + all[j] + "_enable", on ? 1 : 0);
    }
};

// F6: channel select buttons CH1-4, MST, SP
PioneerDDJGRV6.fxChannelAbsolute = function (channel, control, value, status, group) {
    if (value === 0) return;
    var pick = {0x10: "[Channel1]", 0x11: "[Channel2]", 0x12: "[Channel3]", 0x13: "[Channel4]",
                0x14: "[Master]", 0x16: "SAMPLERS"}[control];
    if (pick !== undefined) PioneerDDJGRV6.fxRoute(pick);
};

// F5: effect rotary. Position 1-14 loads the 1st-14th chain preset of the effect unit
// (arrange them in Preferences -> Effects)
PioneerDDJGRV6.fxPos = 0;
PioneerDDJGRV6.fxPosTime = 0;


//
// Round E (custom)
//
PioneerDDJGRV6.roundEInit = function () {
    // Pad FX mode is free: switch its pad LEDs off (normal + Shift layer)
    var chans = [0x97, 0x99, 0x9B, 0x9D, 0x98, 0x9A, 0x9C, 0x9E];
    for (var i = 0; i < chans.length; i++) {
        for (var n = 0; n < 8; n++) {
            midi.sendShortMsg(chans[i], 0x50 + n, 0x00);
        }
    }
};

// Round F (custom): keyboard mode stops and resets the pitch when the pad is released
PioneerDDJGRV6.keyboardPad = function (channel, control, value, status, group) {
    const semis = PioneerDDJGRV6.keyboardSemitones[control & 0x0F];
    if (semis === undefined) return;
    if (value > 0) {
        engine.setValue(group, "pitch_adjust", semis);
        engine.setValue(group, "hotcue_1_activate", 1);
    } else {
        engine.setValue(group, "hotcue_1_activate", 0);
        engine.setValue(group, "play", 0);
        engine.setValue(group, "pitch_adjust", 0);
    }
};


PioneerDDJGRV6.beatFxOnOff = function (channel, control, value, status, group) {
    if (value === 0) return;
    var unit = "[EffectRack1_EffectUnit1]";
    var newState = engine.getValue(unit, "enabled") > 0 ? 0 : 1;
    if (newState === 1) PioneerDDJGRV6.fxSwitchOnSlots();
    engine.setValue(unit, "enabled", newState);
    PioneerDDJGRV6.updateFxLed(newState);
};


PioneerDDJGRV6.levelDepthDirect = function (channel, control, value, status, group) {
    if (control === 0x02) {
        PioneerDDJGRV6.f7_msb = value;
    } else if (control === 0x22) {
        PioneerDDJGRV6.f7_lsb = value;
    }
    var normalized = ((PioneerDDJGRV6.f7_msb << 7) | PioneerDDJGRV6.f7_lsb) / 16383;
    engine.setValue("[EffectRack1_EffectUnit1]", "mix", normalized);
};


//
// Round L (custom)
//
PioneerDDJGRV6.roundLInit = function () {
    PioneerDDJGRV6.fxSwitchOnSlots();
};


//
// Round M (custom)
//
PioneerDDJGRV6.fxBipolarOffset = 0.06;   // filter-type knobs: how far above the middle

// FXKINDS-BEGIN
PioneerDDJGRV6.fxKinds = [
    ["uni"],   // 1 Delay
    ["none", "uni", "none"],   // 2 Echo
    ["bi", "bi"],   // 3 Low Cut Echo
    ["none", "uni", "none"],   // 4 Spiral
    ["uni", "uni"],   // 5 Helix
    ["uni"],   // 6 Reverb
    ["uni"],   // 7 Flanger
    ["uni"],   // 8 Phaser
    ["bi"],   // 9 Filter
    ["uni"],   // 10 Trans
    ["uni"],   // 11 Pitch
    ["uni"],   // 12 Roll
    ["uni", "uni"],   // 13 Mobius Saw
    ["bi"],   // 14 Mobius Tri
];
// FXKINDS-END


PioneerDDJGRV6.fxSelectAbsolute = function (channel, control, value, status, group) {
    if (value !== 0x7F) return;
    var unit = "[EffectRack1_EffectUnit1]";
    var target = (control - 0x20) + 1;
    var now = Date.now();
    if (now - PioneerDDJGRV6.fxPosTime > 500) {
        PioneerDDJGRV6.fxPos = engine.getValue(unit, "loaded_chain_preset");
    }
    var delta = target - PioneerDDJGRV6.fxPos;
    var key = delta > 0 ? "next_chain_preset" : "prev_chain_preset";
    for (var i = 0; i < Math.abs(delta); i++) {
        engine.setValue(unit, key, 1);
        engine.setValue(unit, key, 0);
    }
    PioneerDDJGRV6.fxPos = target;
    PioneerDDJGRV6.fxPosTime = now;
    engine.beginTimer(200, PioneerDDJGRV6.fxSwitchOnSlots, true);
    engine.beginTimer(600, PioneerDDJGRV6.fxSwitchOnSlots, true);
};

// Round N (custom): knob positions come from the saved presets; the script only switches the effects on
PioneerDDJGRV6.fxSwitchOnSlots = function () {
    for (var i = 1; i <= 3; i++) {
        engine.setValue("[EffectRack1_EffectUnit1_Effect" + i + "]", "enabled", 1);
    }
};


//
// Round O (custom)
//
PioneerDDJGRV6.fxArrowStep = 0.1;        // reverb tail step per press
PioneerDDJGRV6.spinbackFactor = 2;       // higher = shorter spinback

// FXARROWS-BEGIN
PioneerDDJGRV6.fxArrowMap = [
    [[1, 1, "time"]],   // 1 Delay
    [[2, 1, "time"], [3, 1, "tail"]],   // 2 Echo
    [[2, 1, "time"]],   // 3 Low Cut Echo
    [[1, 1, "time"], [2, 1, "time"], [3, 1, "time"]],   // 4 Spiral
    [[1, 1, "time"], [2, 1, "time"], [3, 1, "time"]],   // 5 Helix
    [[1, 1, "tail"], [2, 1, "time"]],   // 6 Reverb
    [[1, 1, "time"], [2, 1, "time"]],   // 7 Flanger
    [[1, 1, "time"], [2, 1, "time"]],   // 8 Phaser
    [[3, 1, "tail"]],   // 9 Filter
    [[1, 2, "time"], [2, 2, "time"]],   // 10 Trans
    [[2, 1, "tail"]],   // 11 Pitch
    [[1, 1, "time"]],   // 12 Roll
    [[1, 1, "time"], [2, 1, "time"]],   // 13 Mobius Saw
    [],   // 14 Mobius Tri
];
// FXARROWS-END

// Beat FX arrows: right = longer / slower, left = shorter / faster, for every matching setting
PioneerDDJGRV6.fxArrow = function (channel, control, value, status, group) {
    if (value === 0) return;
    var longer = (control === 0x4B);
    var pos = engine.getValue("[EffectRack1_EffectUnit1]", "loaded_chain_preset");
    var entries = PioneerDDJGRV6.fxArrowMap[pos - 1] || [];
    for (var n = 0; n < entries.length; n++) {
        var slot = "[EffectRack1_EffectUnit1_Effect" + entries[n][0] + "]";
        var key = "parameter" + entries[n][1];
        var cur = engine.getValue(slot, key);
        if (entries[n][2] === "time") {
            engine.setValue(slot, key, longer ? cur * 2 : cur / 2);
        } else {
            engine.setValue(slot, key, cur + (longer ? 1 : -1) * PioneerDDJGRV6.fxArrowStep);
        }
    }
};

// Shift+Slip: spinback while held, then the deck plays on
PioneerDDJGRV6.spinbackWasPlaying = [false, false, false, false];


//
// Round P (custom)
//
PioneerDDJGRV6.spinbackSpeed = 3;      // start speed backwards (Mixxx allows at most 3x)
PioneerDDJGRV6.spinbackTime = 0.35;    // seconds; bigger = longer spinback
PioneerDDJGRV6.spinbackTimers = {};


// Beat FX beat lights: the row 1/4, 1/2, 3/4, 1, 2, 4, 8, 16, 32 follows the time setting of the loaded effect
PioneerDDJGRV6.fxBeatCodes = [[0.25, 0x03], [0.5, 0x04], [0.75, 0x21], [1, 0x05], [2, 0x06],
                              [4, 0x07], [8, 0x08], [16, 0x09], [32, 0x0A]];
PioneerDDJGRV6.fxBeatLast = -1;

PioneerDDJGRV6.fxBeatLed = function () {
    var pos = engine.getValue("[EffectRack1_EffectUnit1]", "loaded_chain_preset");
    var entries = PioneerDDJGRV6.fxArrowMap[pos - 1] || [];
    var code = 0x00;
    for (var n = 0; n < entries.length; n++) {
        if (entries[n][2] !== "time") continue;
        var v = engine.getValue("[EffectRack1_EffectUnit1_Effect" + entries[n][0] + "]", "parameter" + entries[n][1]);
        if (v > 0) {
            var best = 1e9;
            for (var i = 0; i < PioneerDDJGRV6.fxBeatCodes.length; i++) {
                var d = Math.abs(Math.log(v / PioneerDDJGRV6.fxBeatCodes[i][0]));
                if (d < best) {
                    best = d;
                    code = PioneerDDJGRV6.fxBeatCodes[i][1];
                }
            }
        }
        break;
    }
    if (code !== PioneerDDJGRV6.fxBeatLast) {
        midi.sendShortMsg(0xB4, 0x64, code);
        PioneerDDJGRV6.fxBeatLast = code;
    }
};


//
// Round Q (custom)
//
PioneerDDJGRV6.fxBeatBurstTimer = 0;

// check the beat lights every 0.1 s for 2 s, then stop (saves CPU)
PioneerDDJGRV6.fxBeatBurst = function () {
    if (PioneerDDJGRV6.fxBeatBurstTimer) {
        engine.stopTimer(PioneerDDJGRV6.fxBeatBurstTimer);
    }
    var n = 0;
    PioneerDDJGRV6.fxBeatLed();
    PioneerDDJGRV6.fxBeatBurstTimer = engine.beginTimer(100, function () {
        PioneerDDJGRV6.fxBeatLed();
        n++;
        if (n >= 20) {
            engine.stopTimer(PioneerDDJGRV6.fxBeatBurstTimer);
            PioneerDDJGRV6.fxBeatBurstTimer = 0;
        }
    });
};

// startup: one short check instead of a permanent timer
PioneerDDJGRV6.fxBeatStart = function () {
    PioneerDDJGRV6.fxBeatBurst();
};

// every use of the rotary or the arrows starts a new 2 second check
(function () {
    var origSelect = PioneerDDJGRV6.fxSelectAbsolute;
    PioneerDDJGRV6.fxSelectAbsolute = function () {
        origSelect.apply(this, arguments);
        PioneerDDJGRV6.fxBeatBurst();
    };
    var origArrow = PioneerDDJGRV6.fxArrow;
    PioneerDDJGRV6.fxArrow = function () {
        origArrow.apply(this, arguments);
        PioneerDDJGRV6.fxBeatBurst();
    };
})();

// Round R (custom): longer spinback - same start speed, travels far back, slows down and stops the song
PioneerDDJGRV6.spinbackBack = 4;       // seconds of the track it travels back (bigger = further back)
PioneerDDJGRV6.spinbackShape = 1.5;    // 1 = even slow-down, higher = slows down earlier
PioneerDDJGRV6.spinback = function (channel, control, value, status, group) {
    if (value === 0) return;
    var deck = parseInt(group.match(/\d/)[0]);
    if (PioneerDDJGRV6.spinbackTimers[deck]) return;
    if (engine.getValue(group, "play") === 0) return;
    var v0 = PioneerDDJGRV6.spinbackSpeed;
    var p = PioneerDDJGRV6.spinbackShape;
    var total = PioneerDDJGRV6.spinbackBack * (p + 1) / v0;   // seconds the whole spinback lasts
    var t0 = Date.now();
    engine.setValue(group, "scratch2_enable", 1);
    PioneerDDJGRV6.spinbackTimers[deck] = engine.beginTimer(20, function () {
        var t = (Date.now() - t0) / 1000;
        if (t >= total) {
            engine.stopTimer(PioneerDDJGRV6.spinbackTimers[deck]);
            PioneerDDJGRV6.spinbackTimers[deck] = 0;
            engine.setValue(group, "scratch2", 0);
            engine.setValue(group, "scratch2_enable", 0);
            engine.setValue(group, "play", 0);
        } else {
            engine.setValue(group, "scratch2", -v0 * Math.pow(1 - t / total, p));
        }
    });
};


//
// Round T (custom)
//
PioneerDDJGRV6.gridHoldMs = 600;      // hold this long (ms) for the second function
PioneerDDJGRV6.gridTimers = {};

// tap = tapKey on release, hold = holdKey after gridHoldMs
PioneerDDJGRV6.gridTapHold = function (group, id, value, tapKey, holdKey) {
    var tid = group + id;
    if (value > 0) {
        PioneerDDJGRV6.gridTimers[tid] = engine.beginTimer(PioneerDDJGRV6.gridHoldMs, function () {
            PioneerDDJGRV6.gridTimers[tid] = 0;
            script.triggerControl(group, holdKey, 50);
        }, true);
    } else if (PioneerDDJGRV6.gridTimers[tid]) {
        engine.stopTimer(PioneerDDJGRV6.gridTimers[tid]);
        PioneerDDJGRV6.gridTimers[tid] = 0;
        script.triggerControl(group, tapKey, 50);
    }
};

PioneerDDJGRV6.gridArrowLeft = function (channel, control, value, status, group) {
    PioneerDDJGRV6.gridTapHold(group, "L", value, "beats_translate_earlier", "beats_set_halve");
};
PioneerDDJGRV6.gridArrowRight = function (channel, control, value, status, group) {
    PioneerDDJGRV6.gridTapHold(group, "R", value, "beats_translate_later", "beats_set_double");
};
PioneerDDJGRV6.gridMemory = function (channel, control, value, status, group) {
    PioneerDDJGRV6.gridTapHold(group, "M", value, "beats_translate_curpos", "beats_undo_adjustment");
};


//
// Round V (custom): BROWSE rotary and the GRV6 skin
//
// Plain rotate (CC 0x40/64, ch 6): confirmed via aseqdump -p 20:0.
// Main tab of the GRV6 skin: zooms ALL FOUR waveforms to the same level, so a deck that
// was hidden looks the same when it is switched in. Clockwise = zoom in.
// Every other case: scroll the library as before. Scrolling also clears the
// Browse info block of the skin ([Skin],grv6_info_valid), because it shows the preview deck, not the highlighted row.
//
// SHIFT+rotate is a SEPARATE message, not a shift flag alongside the plain one: CC 0x64/100,
// same channel, same relative-encoder convention (1 = +1, 127 = -1) - confirmed via the same
// capture (any deck's SHIFT held sends note 63 on ch 1, unrelated to this CC). See
// browseKnobShiftZoom below; it does not need to check which SHIFT is held, since the hardware
// already only sends CC100 while one is.
//
PioneerDDJGRV6.zoomMin = 1;    // Mixxx waveform_zoom: 1 (zoomed in) .. 10 (zoomed out)
PioneerDDJGRV6.zoomMax = 10;
PioneerDDJGRV6.visibleRowsMin = 3;     // never let the knob zoom out past "3 rows fit" or reach the
PioneerDDJGRV6.visibleRowsMax = 20;    // "0 = off/manual sizing" escape hatch - that is config-file only.

PioneerDDJGRV6.browseKnob = function (channel, control, value, status, group) {
    // relative encoder: 0x01 = +1, 0x7F = -1
    var delta = value >= 0x40 ? value - 0x80 : value;
    if (delta === 0) {
        return;
    }
    if (engine.getValue("[Skin]", "grv6_show_main") === 1) {
        var zoom = engine.getValue("[Channel1]", "waveform_zoom") - delta;
        zoom = Math.max(PioneerDDJGRV6.zoomMin, Math.min(PioneerDDJGRV6.zoomMax, zoom));
        for (var d = 1; d <= 4; d++) {
            engine.setValue("[Channel" + d + "]", "waveform_zoom", zoom);
        }
    } else {
        engine.setValue("[Library]", "MoveVertical", delta);
        engine.setValue("[Skin]", "grv6_info_valid", 0);
    }
};

// SHIFT+rotate (CC 0x64/100, ch 6) - live library zoom, via [Library],grv6_visible_rows.
// Needs the stable 2 patch build (mixxx-build/patches/browse-zoom.patch); on stock Mixxx that
// control is never created, so this is a harmless no-op there. Always active regardless of
// which tab is showing (Browse is the only tab with a visible library table, but there is no
// harm in the setting taking effect in the background before you switch to it).
PioneerDDJGRV6.browseKnobShiftZoom = function (channel, control, value, status, group) {
    var delta = value >= 0x40 ? value - 0x80 : value;
    if (delta === 0) {
        return;
    }
    // Fewer visible rows = taller rows = bigger text, so subtract delta to keep
    // "clockwise = zoom in" consistent with the plain knob's waveform zoom above.
    var rows = engine.getValue("[Library]", "grv6_visible_rows") - delta;
    rows = Math.max(PioneerDDJGRV6.visibleRowsMin, Math.min(PioneerDDJGRV6.visibleRowsMax, rows));
    engine.setValue("[Library]", "grv6_visible_rows", rows);
};


//
// Round W (custom): GRV6 skin deck switch
//
// The DECK 1/3 and DECK 2/4 buttons send note 0x3C on MIDI channels 1-4 (0x90-0x93):
// 0x7F = "this deck is now controlled", 0x00 = "this deck is released" (each press sends both).
// Only the 0x7F message is used. It tells the GRV6 skin which deck each side shows:
//   channel 1 -> left = deck 1, channel 3 -> left = deck 3, channel 2 -> right = deck 2, channel 4 -> right = deck 4.
PioneerDDJGRV6.deckSelect = function (channel, control, value, status, group) {
    if (value !== 0x7F) {
        return;
    }
    var side = (channel % 2 === 0) ? "grv6_left_deck" : "grv6_right_deck";
    engine.setValue("[Skin]", side, channel + 1);
};


//
// Round X (custom): BACK button
//
// Ch 6, note 0x65 - was a plain [Library],MoveLeft binding. Kept exactly that behaviour (so
// browse/search navigation is unchanged) and added: on press, also clear the GRV6 skin's
// error banners ([Library],load_error and [Library],app_error - see the "stable 2" Mixxx
// build's load-failed-banner.patch and error-dialog-banner.patch; on stock Mixxx neither
// control is ever set, so this is a harmless no-op there).
PioneerDDJGRV6.backButton = function (channel, control, value, status, group) {
    engine.setValue("[Library]", "MoveLeft", value > 0 ? 1 : 0);
    if (value > 0) {
        engine.setValue("[Library]", "load_error", 0);
        engine.setValue("[Library]", "app_error", 0);
    }
};


//
// Round Y (custom): non-gated hot cues, and always-reseek loop hot cues
//
// Mixxx's hotcue_N_activate is deliberately gated when pressed on a PAUSED deck: it
// previews (plays while held, stops and seeks back to the cue on release) - see
// CueControl::hotcueActivate in Mixxx's source. It is only NOT gated if the deck is
// already playing at the moment of the press (then it just jumps, like a normal hot
// cue). Setting play=1 immediately before activating the hotcue makes Mixxx always take
// that non-gated path, whether or not the deck was already playing: press jumps there
// and keeps playing, release does nothing (confirmed safe: CueControl's release handler
// is a no-op for a hotcue that was never put into preview state).
//
// Loop-type hot cues (a Rekordbox hot cue that is actually a saved loop - see
// mixxx-build/patches/rekordbox-loop-hotcues.patch) are a different case, reported
// separately: once such a hot cue is already the deck's "current saved loop",
// hotcue_N_activate's Loop branch just toggles loop_enabled in place on every further
// press - it never seeks back to the cue's start again (CueControl::hotcueActivate,
// case mixxx::CueType::Loop, the "m_pCurrentSavedLoopControl == pControl" branch calls
// setLoop(..., !loopActive) with no seek). What was wanted instead: every press always
// jumps to the cue's start and (re)activates the loop from there, playing or not,
// in the loop already or not. Mixxx has a control that already does exactly that,
// unconditionally, every time - hotcue_N_gotoandloop (CueControl::hotcueGotoAndLoop) -
// so loop-type hot cues are routed there instead of hotcue_N_activate. A hot cue's
// end position (hotcue_N_endposition) is Cue::kNoPosition (-1) unless it is a saved
// loop, which is how loop-type is detected here without needing a source patch.
//
// Bound to all 8 pad positions (midino 0x00-0x07) on all 4 decks; the hotcue number is
// the MIDI note + 1, since that is exactly how the pads are laid out.
PioneerDDJGRV6.hotcuePlay = function (channel, control, value, status, group) {
    const hotcueNum = control + 1;
    const key = "hotcue_" + hotcueNum;
    if (value > 0) {
        if (engine.getValue(group, key + "_endposition") >= 0) {
            if (engine.getValue("[Skin]", "grv6_set_hotcue_gate") === 1 &&
                    engine.getValue(group, "play") === 0) {
                // Gate mode on a paused deck: Mixxx's own hot cue preview. It plays from the
                // loop's start with the loop on while the pad is held, and on release pauses
                // and returns to the cue (CueControl::hotcueActivatePreview).
                engine.setValue(group, key + "_activate", 1);
            } else {
                engine.setValue(group, key + "_gotoandloop", 1);
            }
        } else {
            // Regular hot cue: explicitly drop any active loop first. hotcue_N_activate's
            // HotCue branch (CueControl::hotcueGoto) only seeks - it does not touch
            // loop_enabled, so without this a loop left on from an earlier loop hot cue
            // kept bounding playback even after jumping to a plain cue point inside or at
            // the edge of it.
            engine.setValue(group, "loop_enabled", 0);
            // Settings tab, "HOT CUE MODE": 1 = gate. Then play is left alone, so Mixxx's own
            // behaviour applies (paused: plays while held, back to the cue on release).
            if (engine.getValue("[Skin]", "grv6_set_hotcue_gate") !== 1) {
                engine.setValue(group, "play", 1);
            }
            engine.setValue(group, key + "_activate", 1);
        }
    } else {
        // Release: reset whichever of the two was actually used above - both are
        // ControlPushButtons that only act on a rising edge, so this does nothing on its
        // own, it just resets state so the next press is seen as a real change instead of
        // being silently deduplicated against a CO stuck at 1. Harmless no-op for
        // whichever of the two was not the one used on press.
        engine.setValue(group, key + "_activate", 0);
        engine.setValue(group, key + "_gotoandloop", 0);
    }
};


//
// Round Z (custom): hardware PREVIEW button
//
// GROOVE CIRCUIT B5 PREVIEW used to be a plain LoadSelectedTrackAndPlay binding, so it
// loaded and played the highlighted track but never told the GRV6 skin to show its Browse
// info block ([Skin],grv6_info_valid) - only the on-screen PREVIEW button did that. Mirror
// the on-screen button exactly: loads, plays and marks the info valid, all on press.
PioneerDDJGRV6.hardwarePreview = function (channel, control, value, status, group) {
    if (value > 0) {
        engine.setValue(group, "LoadSelectedTrackAndPlay", 1);
        engine.setValue("[Skin]", "grv6_info_valid", 1);
    }
};


//
// Round AB (custom): Cue/Loop CALL - halve/double an active loop, otherwise jump to
// the track start/end (deliberate dual-mode behaviour, CDJ-style: CALL is a loop
// control when a loop is running, and a search/skip control when it is not).
//
// While a loop is active: forwards to Mixxx's loop_halve/loop_double as before.
// While no loop is active: triggers EngineBuffer's own "start"/"end" buttons
// (src/engine/enginebuffer.cpp - slotControlStart/slotControlEnd, doSeekFractional
// to 0.0/1.0), the same controls a "search backward/forward to track end" button
// would use on stock Mixxx. Left = start, right = end.
// control is the MIDI note (0x51 = CALL left, 0x53 = CALL right). loop_halve/
// loop_double are ControlPushButtons that only act on a rising edge (see
// LoopingControl::slotLoopHalve/slotLoopDouble's "if (pressed <= 0.0) return;"), so
// the release (value 0) is always forwarded too - it does nothing on its own, but
// resets the CO so the next press is seen as a real change instead of silently being
// deduplicated against a CO stuck at 1.
PioneerDDJGRV6.loopHalveDoubleGated = function (channel, control, value, status, group) {
    const looping = engine.getValue(group, "loop_enabled") > 0;
    if (!looping && engine.getValue(group, "play") > 0) {
        // Not looping and currently playing: do nothing. A start/end jump here would
        // restart or skip to the end of a track that is actively playing - only safe
        // to do while paused. Halve/double (the looping branch) is unaffected.
        return;
    }
    const key = looping
        ? (control === 0x51 ? "loop_halve" : "loop_double")
        : (control === 0x51 ? "start" : "end");
    if (value > 0) {
        engine.setValue(group, key, 1);
    } else {
        engine.setValue(group, key, 0);
    }
};


//
// Round AC (custom): Settings tab - what pressing LOAD does
//
// Connected to [ChannelN],LoadSelectedTrack for all four decks (see init), so it fires for the
// hardware LOAD buttons and for the on-screen LOAD 1-4 buttons alike, on press (value > 0).
// Two switches on the Settings tab ([Skin] controls, saved in mixxx.cfg; a missing control reads
// as 0 = off, so on an older skin nothing changes):
//   grv6_set_stop_preview - stop the preview deck, so the previewed track does not keep playing
//                           over the deck it was just loaded into.
//   grv6_set_close_browse - if the Browse tab is showing, go back to the Main tab. Done on a short
//                           timer so the page switch cannot race the library reading its selected
//                           row for this very load.
PioneerDDJGRV6.onLoadPress = function (value) {
    if (value <= 0) {
        return;
    }
    if (engine.getValue("[Skin]", "grv6_set_stop_preview") === 1) {
        engine.setValue("[PreviewDeck1]", "play", 0);
    }
    if (engine.getValue("[Skin]", "grv6_set_close_browse") === 1 &&
            engine.getValue("[Skin]", "show_maximized_library") === 1) {
        engine.beginTimer(150, function () {
            engine.setValue("[Skin]", "grv6_show_main", 1);
        }, true);
    }
};
