# GRV6 skin - screen reference

Everything the skin shows, tab by tab.

- Screen: 1920x1080 touchscreen, kiosk (no mouse, no keyboard), Raspberry Pi 4.
- Controller: Pioneer DDJ-GRV6, 4 decks. The screen shows 2 decks at a time: LEFT = deck 1 or 3, RIGHT = deck 2 or 4 (the controller's DECK buttons switch). The other deck of each side is shown small.
- Themes: dark and light, five accent colours (Settings > Appearance).

## Always visible: top bar (50 px)

| Element | Shows / does |
|---|---|
| Tabs | MAIN, BROWSE, SAMPLER, SETTINGS (tap to switch; the lit tab is the current one). Planned: an RMX EMU tab |
| Middle block, MAIN and SAMPLER tabs | CFX: name of the colour effect + ON/OFF tag. FX STRIP: name of the beat effect + ON/OFF tag. Text "all channels" |
| Middle block, BROWSE tab | SEARCH field (with the controller's browse knob / on-screen keyboard), outlined when it has focus |
| Middle block, SETTINGS tab | "SETTINGS - Changes save automatically", and a red REC indicator with elapsed time while recording |
| CPU | small bar (audio load) |
| MASTER | stereo level meter (2 thin bars) |
| Clock | HH:MM |
| Banners (above the top bar, only when needed) | red "TRACK NOT FOUND - check the USB - press BACK to dismiss"; red "MIXXX ERROR - see mixxx.log - press BACK to dismiss" |

## MAIN tab

### Narrow column, left edge (one block per visible deck: top = left deck, bottom = right deck)

| Element | Shows / does |
|---|---|
| ON AIR icon | lit red while the deck's channel fader is up |
| DECK badge | big deck number (1-4) |
| CUE button | headphone cue on/off (lit when on) |
| PLAY button | play/pause (green when playing) |

### Waveform area (middle, full width)

From top to bottom: overview of the LEFT deck, scrolling waveform LEFT deck, scrolling waveform RIGHT deck, overview of the RIGHT deck.

| Element | Shows |
|---|---|
| Scrolling waveform | coloured (RGB) waveform, centre play line, beat ticks top/bottom, red downbeat bars, CUE mark, HOT 1-8 marks (8 colours, labelled), loop IN/OUT marks and loop area shading |
| Overview waveform | whole track, played part darkened, play position, hot cue numbers, minute markers |
| Zoom | the controller's BROWSE knob zooms the scrolling waveforms while on MAIN |

### Deck panels (bottom, one per side, about 270 px high)

| Element | Shows / does |
|---|---|
| Cover art | album cover, or "NO TRACK LOADED" |
| Header | deck number badge, title, artist |
| TIME box | big time, caption REMAIN or TIME (tap the number to switch), footer "TRACK n · m:ss" (track number and length) |
| BPM box | big BPM (one decimal), LEADER / SYNC tags, tempo change "x.xx %", tempo range tag (±6/10/16/50) |
| KEY box | key (Camelot like 8A, or traditional like D♯m / E♭m - Settings), MT tag lit when master tempo (keylock) is on; while the key is shifted: ORIGINAL key and SHIFT in semitones |
| Level meter | channel level, 2 thin vertical bars |
| Buttons | SYNC, QUANT, KEYLOCK, SLIP (lit when on) |
| LOOP box | "LOOP  4 BEAT" - the loop size, lit while a loop is active |

### Deck strip (30 px, under each deck panel) - the OTHER deck of that side

Small cover, deck number, ON AIR icon, title, artist, progress bar, BPM, key, time.

## BROWSE tab

| Area | Contents |
|---|---|
| Deck cards (top row, 92 px) | one per visible deck: small cover, deck number, title, artist, progress bar, time + REMAIN/TIME, BPM + LEADER/SYNC tags, key, tempo % |
| Sidebar (left, 196 px) | Tracks, Auto DJ, Playlists, Crates, Computer, Recordings, History, Analyse, Rekordbox (USB sticks and their playlists, tree with fold-out) |
| Track table (middle) | columns Color (swatch), # (playlist position), Title, Artist, BPM, Key, Rating (stars), Duration. Big rows (3-20 rows on screen, set with SHIFT + BROWSE knob or Settings). Selected row filled with the accent colour. Key cell green ("traffic light") when the key mixes with the playing deck's key. Scrolled by the controller's browse knob |
| Info panel (right, 330 px) | cover of the selected/previewed track; title, artist, comment, star rating, KEY, BPM - or "Preview to see more info" |
| PREVIEW button | plays the selected track on the preview player (headphones), lit while previewing |
| LOAD 1 / LOAD 2 / LOAD 3 / LOAD 4 | 2x2 big square buttons: load the selected track onto that deck |
| Loading behaviour | optional: loading stops the preview, loading returns to MAIN (Settings) |

## SAMPLER tab (not designed yet - plain layout)

Two rows of 8 pads: top = samplers 1-8 (heading "DECK 1 · SAMPLERS 1-8", follows the left deck), bottom = samplers 9-16. Each pad: number, sample title, LOAD button (loads the selected library track), PLAY button (lit / "PLAYING" while playing; left tap plays from the start, right/long = cue).

## SETTINGS tab (designed, 4 columns, 8 numbered cards)

| Card | Controls |
|---|---|
| 01 MIXER | MAIN EQ: 3 vertical faders BASS / MIDS / HIGHS (-12..+12 dB, value under each, RESET). CROSSFADER ASSIGN: per deck LEFT / THRU / RIGHT + presets ALL THRU, DEFAULT. CROSSFADER CURVE: SMOOTH / SHARP CUT. LOAD ONTO PLAYING DECK: ALLOW / BLOCK |
| 02 CUES | HOT CUE MODE: NORMAL / GATE |
| 03 BROWSE AND LIBRARY | KEY NOTATION: CAMELOT / TRADITIONAL with "SHOWS AS 2A / D♯m / E♭m"; ACCIDENTALS: SHARPS / FLATS (only with traditional); BROWSE TEXT SIZE: - n ROWS +; switches STOP PREVIEW WHEN LOADING, CLOSE BROWSE AFTER LOADING |
| 04 RECORDING | big REC / STOP button, READY / RECORDING light, elapsed time |
| 05 STARTUP DEFAULTS | switches QUANTIZE ON AT STARTUP, MASTER TEMPO ON AT STARTUP; TEMPO RANGE ±6 / ±10 / ±16 / ±50 %; TIME READOUT TIME / REMAIN |
| 06 APPEARANCE | THEME DARK / LIGHT; ACCENT COLOUR swatches orange / green / blue / red / purple |
| 07 USB STICKS | up to 4 rows "USB 1..4": size, free space, used bar, warning "DECK n HAS A TRACK FROM THIS STICK", EJECT -> TAP AGAIN -> EJECTING -> SAFE TO REMOVE / REFUSED / FAILED; empty state "No USB stick connected" |
| 08 SYSTEM | SLEEP AFTER NO ACTIVITY: OFF / 10 MIN / 30 MIN / 1 H / 1.5 H + SLEEP NOW; POWER: hold POWER OFF 5 s; About: Mixxx version, skin version |

## Full-screen states

| State | Shows |
|---|---|
| Start-up | splash with the logo and a progress bar |
| Sleep | black screen; any tap or controller input wakes it |
| Power off | full-screen shutdown picture (logo + "SHUTTING DOWN") until the power is off |

## Driven by the controller (no screen button, but the screen reacts)

DECK 1-4 buttons (which deck shows on each side), BROWSE button (opens/closes Browse), browse knob (scroll the list; zoom the waveforms on MAIN; SHIFT = bigger/smaller rows), BACK (library back, dismiss error banners), LOAD, PREVIEW, hot cue pads (marks on the waveform), loops (IN/OUT marks, LOOP box), tempo fader and key shift (BPM and KEY boxes), FX and CFX (top bar).
