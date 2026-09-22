# Mixxx "stable 2" build

Stable 1 = the Mixxx you run now (Debian mixxx 2.5.0+dfsg-3, unpatched).
Stable 2 = the same source plus the patches in `patches/series` (order matters):

1. pdb-corruption-hardening: no crash on damaged Rekordbox export databases, no race when a device is opened
2. xdj-behavior: waveform colours no longer react to the EQ, fixed waveform height, loop from cue, different Filter curve
3. xdj-hardware: red downbeat bars on the beatgrid, controller reconnect watchdog (the DDJ-400 script change does not touch your GRV6 mapping)
4. rekordbox-import-fixes: readable cue comments, playlists no longer missing most tracks
5. headphone-gain-ceiling: headphone gain limit +14 dB -> +30 dB
6. rekordbox-playlist-order: playlist track order kept
7. rekordbox-unicode-paths: accented file names on Rekordbox USB sticks (trimmed: only the Rekordbox part)
8. rekordbox-path-fallback: file-not-found fallback for FAT sticks mounted without UTF-8
9. bpm-readout: steady, one-decimal BPM from the deck's exact tempo (touches engine BPM code)
10. perf-render-repaint-waveform-only: the three waveform-marker files beatgrid-ticks needs, trimmed out of perf-render-repaint.patch (the rest of that patch touches library-view files that depend on patches not in this build)
11. beatgrid-ticks: downbeat markers become thin red bars and every beat becomes a short tick at the top/bottom edge, instead of xdj-hardware's large red triangles and full-height white lines
12. effect-ring-out: Echo and Reverb ring out naturally when their effect unit is disabled, instead of being cut off after one audio callback (EffectManifest gains tailTimeMillis, default 0 - unaffected: every other effect and every other effect rack, including the quick-effect racks)
13. load-failed-banner: a failed track load (e.g. a pulled USB) sets [Library],load_error instead of showing a modal dialog with no way to dismiss it on a kiosk with no keyboard/mouse; the skin shows it as a banner, clearing it needs a controller-button binding not included here yet (see GRV6/SKIN-NOTES.md)

Checked here: all thirteen apply cleanly, in this exact order, on the unpatched Debian source (fresh extraction, tested end to end). Not checked here: compiling (that is what the GitHub build does) or hearing/using any of it (that is what the Pi does).
Left out on purpose: everything that only serves the Pioneered touch skin, the library/browse layout patches (library-ui, browse-bpm-column), jog-nudge (DDJ-400), browse-encoder-zoom (done in the mapping script instead).
