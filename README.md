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

Checked here: all nine apply cleanly, in this order, on the unpatched Debian source. Not checked here: compiling (that is what the GitHub build does).
Left out on purpose: everything that only serves the Pioneered touch skin, the library/browse layout patches, beatgrid-ticks, perf-render-repaint, jog-nudge (DDJ-400), browse-encoder-zoom (done in the mapping script).
