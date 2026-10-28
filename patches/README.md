# Patches

Patches for the Debian source package `mixxx 2.5.0+dfsg-3` (trixie). They are applied with `patch -p1`, in the order of a series file:

| Series file | Build | Workflow | Package version |
|---|---|---|---|
| [`series`](series) | stable 2 (frozen, known good fallback) | [`build.yml`](../.github/workflows/build.yml) | `2.5.0+dfsg-3+grv6.rN.1` |
| [`series-stable3`](series-stable3) | stable 3 (current) | [`build-stable3.yml`](../.github/workflows/build-stable3.yml) | `2.5.0+dfsg-3+grv6.s3rN.1` |

The `s3` makes every stable 3 version sort above every stable 2 version. Either build can be installed over the other with `apt install --allow-downgrades`.

## Overview

| # | Patch | What it changes | Stable 2 | Stable 3 |
|---:|---|---|:---:|:---:|
| 1 | [pdb-corruption-hardening](pdb-corruption-hardening.patch) | No crash on damaged Rekordbox export databases | ✓ | ✓ |
| 2 | [xdj-behavior](xdj-behavior.patch) | XDJ-style waveforms, loop from cue, Filter curve | ✓ | ✓ |
| 3 | [xdj-hardware](xdj-hardware.patch) | Red downbeat bars, controller reconnect watchdog | ✓ | ✓ |
| 4 | [rekordbox-import-fixes](rekordbox-import-fixes.patch) | Readable cue comments, complete playlists | ✓ | ✓ |
| 5 | [headphone-gain-ceiling](headphone-gain-ceiling.patch) | Headphone gain up to +30 dB | ✓ | ✓ |
| 6 | [rekordbox-playlist-order](rekordbox-playlist-order.patch) | Rekordbox playlist order kept | ✓ | ✓ |
| 7 | [rekordbox-unicode-paths](rekordbox-unicode-paths.patch) | Accented file names on Rekordbox sticks | ✓ | ✓ |
| 8 | [rekordbox-path-fallback](rekordbox-path-fallback.patch) | File-not-found fallback for FAT sticks | ✓ | ✓ |
| 9 | [bpm-readout](bpm-readout.patch) | Steady one-decimal BPM | ✓ | ✓ |
| 10 | [perf-render-repaint-waveform-only](perf-render-repaint-waveform-only.patch) | Waveform marker groundwork for #11 | ✓ | ✓ |
| 11 | [beatgrid-ticks](beatgrid-ticks.patch) | Thin red downbeats, short beat ticks | ✓ | ✓ |
| 12 | [effect-ring-out](effect-ring-out.patch) | Echo and Reverb ring out when switched off | ✓ | ✓ |
| 13 | [load-failed-banner](load-failed-banner.patch) | Failed track load shows a banner, not a dialog | ✓ | ✓ |
| 14 | [error-dialog-banner](error-dialog-banner.patch) | Other errors show a banner, not a dialog | ✓ | ✓ |
| 15 | [sound-device-startup-retry](sound-device-startup-retry.patch) | Retries the sound card at startup | ✓ | ✓ |
| 16 | [rekordbox-loop-hotcues](rekordbox-loop-hotcues.patch) | Rekordbox saved loops import as loop cues | ✓ | ✓ |
| 17 | [key-display-sharps](key-display-sharps.patch) | One spelling for F♯ and D♯m | ✓ | ✓ |
| 18 | [rekordbox-loading-spinner](rekordbox-loading-spinner.patch) | Busy flag while a Rekordbox stick is read | ✓ | – |
| 19 | [browse-zoom](browse-zoom.patch) | Live library zoom (rows on screen) | ✓ | ✓ |
| 20 | [rekordbox-force-sort](rekordbox-force-sort.patch) | Rekordbox lists always open sorted | ✓ | ✓ |
| 21 | [rekordbox-fixed-columns](rekordbox-fixed-columns.patch) | Fixed column set filling the width | ✓ | ✓ |
| 22 | [key-traffic-light](key-traffic-light.patch) | Key cell turns green when it mixes with the playing deck | ✓ | ✓ |
| 23 | [rekordbox-key-notation-and-bpm-sort](rekordbox-key-notation-and-bpm-sort.patch) | Camelot keys, Rekordbox sorted by BPM | ✓ | ✓ |
| 24 | [rekordbox-color-column](rekordbox-color-column.patch) | Rekordbox colour tag column | ✓ | ✓ |
| 25 | [rekordbox-bpm-column](rekordbox-bpm-column.patch) | BPM column in the fixed layout | ✓ | ✓ |
| 26 | [rekordbox-duration-column-fix](rekordbox-duration-column-fix.patch) | Duration column no longer off-screen | ✓ | ✓ |
| 27 | [rekordbox-rating-column](rekordbox-rating-column.patch) | Star rating column | ✓ | ✓ |
| 28 | [rekordbox-force-show-columns](rekordbox-force-show-columns.patch) | Fixed columns always shown | ✓ | ✓ |
| 29 | [deck-key-camelot](deck-key-camelot.patch) | Camelot keys in the deck panels | ✓ | ✓ |
| 30 | [no-bpm-lock-checkbox](no-bpm-lock-checkbox.patch) | No BPM lock checkbox | ✓ | ✓ |
| 31 | [no-bpm-check-state](no-bpm-check-state.patch) | No BPM lock checkbox, for real | ✓ | ✓ |
| 32 | [key-style-setting](key-style-setting.patch) | Key notation as a live setting | – | ✓ |
| 33 | [main-eq-graphic-default](main-eq-graphic-default.patch) | Graphic EQ on the main mix by default | – | ✓ |
| 34 | [browse-zoom-step](browse-zoom-step.patch) | +/- buttons for the library zoom, zoom saved | – | ✓ |
| 35 | [rekordbox-viewport-resize](rekordbox-viewport-resize.patch) | Columns fit the view exactly | – | ✓ |
| 36 | [library-fixed-columns](library-fixed-columns.patch) | Fixed columns for the whole library | – | ✓ |
| 37 | [key-selected-traffic-light](key-selected-traffic-light.patch) | Key traffic light on the selected row | – | ✓ |
| 38 | [grv6-settings-system](grv6-settings-system.patch) | Backend of the skin's Settings tab | – | ✓ |
| 39 | [grv6-settings-fixes](grv6-settings-fixes.patch) | Settings fixes, shutdown picture | – | ✓ |

## Adding a patch

1. Extract the pristine Debian source (`dpkg-source -x mixxx_2.5.0+dfsg-3.dsc`), apply the Debian patches, then every patch of the series.
2. Copy the tree, make the change, and write a unified diff (`diff -u`, `a/` and `b/` paths) into `patches/<name>.patch`.
3. Add `<name>` to the end of `series-stable3` (never to `series`, stable 2 is frozen).
4. Apply the whole series again on a fresh extraction: no `.rej` files, no fuzz.
5. Add a line to the table above and a paragraph to the details below, then run the stable 3 workflow.

## Details

Numbers match the overview and are how the patches refer to each other. The apply order is the series file's (#10 and #11 come right after #3 there).

### Stable 2 (and stable 3)

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
12. effect-ring-out: Echo and Reverb ring out naturally when their effect unit is disabled, instead of being cut off after one audio callback (EffectManifest gains tailTimeMillis, default 0 - unaffected: every other effect and every other effect rack, including the quick-effect racks). The tail is fed by a separate silent buffer that only starves the effect itself of new input - the channel's own dry volume is untouched, so switching FX focus to a different channel, or turning the effect off, no longer makes the channel's volume disappear.
13. load-failed-banner: a failed track load (e.g. a pulled USB) sets [Library],load_error instead of showing a modal dialog with no way to dismiss it on a kiosk with no keyboard/mouse; the skin shows it as a banner, cleared by the controller's BACK button (channel 6, note 0x65 - see docs/skin-notes.md)
14. error-dialog-banner: the same fix as #13, but for ErrorDialogHandler - the one shared route almost every OTHER Mixxx error goes through (database, library import/export, broadcasting, recording, controller-script exceptions, ...). Sets [Library],app_error instead of building any dialog; same banner, same BACK button clears it.
15. sound-device-startup-retry: if the configured sound devices fail to open at startup (plausible on a Pi if a USB interface has not finished enumerating yet), retry a few times instead of showing a dialog nothing can dismiss; if it still fails, exit(0) so the kiosk's restart loop (~/.xinitrc) gets another try. Startup only - a device lost mid-session is a different, untouched code path.
16. rekordbox-loop-hotcues: a Rekordbox hot cue that is actually a saved loop (CUE_ENTRY_TYPE_LOOP) now imports into Mixxx as a real Loop cue with its correct start and end, instead of losing its length and becoming a plain point cue.
17. key-display-sharps: the two enharmonic key names that used to show both spellings (F♯/G♭ and D♯m/E♭m) now show sharps only (F♯, D♯m), matching every other key in the traditional-notation table which already picks one spelling. Only these two string-table entries change; nothing else about key detection or display.
18. rekordbox-loading-spinner: [Library],grv6_rekordbox_busy is set while RekordboxFeature scans a USB device or parses a device's playlists, cleared when each finishes; the skin shows it as a banner across the top of Browse. Both are the existing QtConcurrent worker phases RekordboxFeature already had - no new threading.
19. browse-zoom: Library gains a live [Library],grv6_visible_rows control (3-20, default 8, 0 = off/manual sizing) - row height and font are derived from the viewport so exactly that many rows fit. Ported from Pioneered's library-ui.patch, minus its Preferences-dialog spinner (replaced with the live control so the GRV6 mapping's shift+browse-knob can drive it directly).
20. rekordbox-force-sort: Rekordbox track lists and playlists always open sorted by # (playlist position) ascending, regardless of any saved header sort state.
21. rekordbox-fixed-columns: Rekordbox views show a fixed column set (#, Title, Artist, Key, Duration) with proportional widths that fill the viewport. Every other library source (Mixxx library, crates, playlists, other USB formats) is unaffected.
22. key-traffic-light: the Key cell in any library table is highlighted green when Camelot-compatible with the currently playing "master" deck's key (most recently started of the playing decks; nothing highlighted while nothing is playing). Side effect: the Key column everywhere now always shows a fixed notation (see #23), regardless of the Preferences key-notation setting.
23. rekordbox-key-notation-and-bpm-sort: the Key column everywhere now always shows Camelot-wheel notation (Mixxx calls it "Lancelot" internally, e.g. "8A") instead of whatever #22 first forced (musical note names). Also: Rekordbox playlists now default-sort by BPM ascending instead of # (overrides #20's default for Rekordbox specifically; the force-sort mechanism itself is unchanged).
24. rekordbox-color-column: the Rekordbox track color tag (already parsed into the library's Color column, just never shown) is added to the fixed column layout from #21, as a narrow swatch at the left edge - reuses Mixxx's own color cell rendering, no new drawing code.
25. rekordbox-bpm-column: adds a BPM column (between Artist and Key) to the fixed layout from #21, so BPM - already the default sort from #23 - can also be clicked to re-sort manually, the same as every other visible column.
26. rekordbox-duration-column-fix: the Duration column (rightmost, meant to stretch to the right edge via setStretchLastSection) was reported pushed off-screen. Root cause: setStretchLastSection is called in loadTrackModel() before applyFixedColumnWidths()'s moveSection() reordering, so Qt could still be tracking a different column as "last" for stretch purposes when it was set. Duration's width is now also set explicitly (viewport width minus every other column's width, floored at its own content minimum) instead of relying solely on the stretch mechanism; setStretchLastSection is kept too, for live window-resize tracking.
27. rekordbox-rating-column: adds a star Rating column (between Key and Duration) to the fixed layout from #21. The data was already being imported from Rekordbox (track->rating(), bound into the temp table's rating column since the very first Rekordbox patches) and the column was visible before #21 restricted the layout - reuses Mixxx's own StarDelegate rendering, no new drawing code.
28. rekordbox-force-show-columns: BPM was reported missing from the Rekordbox table despite #25 adding it. Root cause: loadTrackModel() only ever calls hideSection() for columns that should be hidden, never showSection() for columns that should be visible - so a column hidden in an *earlier* session (BPM was internal/hidden under #21-24, before #25 exempted it) stays hidden forever once Qt persists that header state, regardless of what isColumnInternal() says afterwards. Fixed columns (Rekordbox, fixedColumnLayout() == true) now get every non-internal column force-shown on every load, overriding any stale persisted state; every other model (the normal Mixxx library, crates, playlists) is untouched and keeps respecting the user's own manual column choices.
29. deck-key-camelot: the deck panels' own Key widgets (WKey - Main tab, browse cards, deck strips, info box) were still showing traditional key names after #22/#23 forced Camelot in the library table. Different code path: WKey calls KeyUtils::keyToString(key) with no notation argument, defaulting to KeyNotation::Custom, which reads a static cache (KeyUtils::s_notation) only ever populated by the Key Preferences page (DlgPrefKey) - it does not react to [Library],key_notation being set live, so a skin manifest attribute cannot fix this (tried, reverted - see docs/skin-notes.md). WKey now calls keyToString(key, KeyUtils::KeyNotation::Lancelot) directly, bypassing the cache entirely, the same way the library table's Key column already does.
30. no-bpm-lock-checkbox: the BPM column's "lock against re-analysis" checkbox (BPMDelegate) was reported as an unstyled, oversized box. A QSS attempt to shrink/hide its indicator did not visibly take effect - Qt's item-view check indicator does not necessarily respect ::indicator width/height the way a real QCheckBox widget would, and Mixxx's own documented styling for this exact widget only ever covers swapping its icon image, never sizing it. BaseTrackTableModel::delegateForColumn() no longer assigns BPMDelegate at all; the BPM column falls through to the default delegate (plain numeric text) everywhere - every library table (normal library, crates, playlists, Rekordbox), since the method is `final` and cannot be overridden per-model. Not used on this rig either way (BPM values come from Rekordbox's own analysis, not Mixxx's).
31. no-bpm-check-state: #30 alone did not remove the BPM box (confirmed on an installed r9.1). Root cause: BaseTrackTableModel::roleValue() answers Qt::CheckStateRole for the BPM column from the bpm_lock field, and ANY item delegate (including the default one #30 falls back to) draws a checkbox whenever the model supplies check-state data. Rekordbox's temp table has no bpm_lock column, so every cell answered "undecidable" (Qt::PartiallyChecked), drawn as a solid box over the BPM number. The BPM case is dropped from the CheckStateRole switch, so BPM returns no check state at all. Applies to every library table, same scope as #30. The write side (setData toggling the lock) is untouched but unreachable once no indicator is drawn.

### Stable 3 only

Stable 3 leaves out #18 (the banner never showed in testing and was removed from the skin) and adds:

32. key-style-setting: how keys are written on screen is now a live setting instead of the fixed Camelot of #23/#29. Two saved values, `[Library],grv6_key_traditional` (0 = Camelot, 1 = traditional names) and `[Library],grv6_key_flats` (0 = sharps, 1 = flats, traditional only), created by `Library` before the skin loads, and four push buttons that change them: `grv6_key_set_camelot`, `grv6_key_set_traditional`, `grv6_key_set_sharps`, `grv6_key_set_flats` (a skin button can only write 1, and on a plain value that can never switch back, which is what the first version of this patch got wrong - it made the values plain and the skin toggled them). `KeyUtils::keyToGrvString()` turns a key into text from two full 24-name tables (every black key spelled as a sharp, or every one as a flat - the stock traditional table mixes both) or the Camelot name. Used by the deck panels' Key widget (`WKey`, which also redraws when either value changes) and by the library Key column, which repaints on its own the next time it is shown. The Key preferences page, sorting, the traffic-light compatibility check and the search are untouched (they work from the raw key value).
33. main-eq-graphic-default: `EffectsManager::setup()` loads the 8-band Graphic EQ into the main-mix EQ slot (`[OutputEffectRack_[Master]_Effect1]`) when effects.xml left it empty, the same way `loadDefaultEqsAndQuickEffects()` fills the per-deck EQ slots. Its knobs are `parameter1` (bass shelf), `parameter2`-`parameter7` (six mid bands) and `parameter8` (treble shelf), -12 to +12 dB, so the skin can put three touch knobs on them. An EQ that effects.xml already restored is left alone, so knob positions survive restarts.
34. browse-zoom-step: `[Library],grv6_visible_rows_up` / `grv6_visible_rows_down` push buttons (+1 / -1 row, clamped to 3-20, the same range as the controller knob) so a skin's stepper can change the browse text size, and every change of `grv6_visible_rows` (knob or stepper) is now written to the `VisibleRows` config value, which the constructor already read back, so the zoom survives a restart (it used to reset to 8).
35. rekordbox-viewport-resize: the last digits of the Duration column were clipped, by 6 pixels. Cause: `applyFixedColumnWidths()` asked for a 14 px Color column, but `WTrackTableViewHeader` sets a minimum section size of 20, so the columns added up to 6 px more than the function's own sum and Duration, the last column (sized as viewport minus the others), ended 6 px past the viewport. Fixed twice over: the requested Color width is at least the header's minimum, and after all widths are set the columns are fitted to the viewport using the header's real length (Duration is trimmed or grown, and Title gives up the rest if Duration is already as narrow as its text allows). Also `WTrackTableView::viewportEvent()` re-runs the whole thing on every viewport resize, because the vertical scroll bar appearing or disappearing shrinks or grows the viewport without the view itself being resized. (Tried and dropped before finding the cause: a stylesheet `padding-right`, which only worked on the selected row, and reserving the scroll bar's width in advance.) The function logs one line (`GRV6 fixed columns: viewport ... header ... duration ...`) to mixxx.log each time, in case the widths ever need checking again.
36. library-fixed-columns: the fixed appliance column layout of #21-#28 (Color, #, Title, Artist, BPM, Key, Rating, Duration, widths filled to the viewport) now also applies to the Mixxx library (Tracks), playlists, crates, history and Auto DJ, not only Rekordbox. `LibraryTableModel` and `TrackSetTableModel` return true from `fixedColumnLayout()`. The view now shows exactly the fixed set and hides every other column (Preview, Album, Year, Genre, ...) on every load, instead of relying on each model's `isColumnInternal()`, and ignores `isColumnHiddenByDefault()` for these models. A column the model does not have (Tracks and crates have no # column) is simply left out and the others share the width. Hidden/missing tracks, Browse and the other external libraries keep Mixxx's own layout. If the columns do not add up to the viewport, the log lists every shown section with its width (`GRV6 fixed columns: shown section ...`).
37. key-selected-traffic-light: the green traffic-light Key cell (#22) disappeared on the selected row, because the stylesheet paints a selected row with the selection colour over every cell. The Key column now has its own small delegate (`GrvKeyDelegate`, defined in basetracktablemodel.cpp, no new files) that draws a cell with a background of its own as if it were not selected, so the traffic light shows on the highlighted row too.
38. grv6-settings-system: the backend of the skin's Settings tab, in a new class `Grv6System` (src/grv6/, added to CMakeLists.txt) that `MixxxMainWindow::initialize()` creates before the skin loads. It owns the `[GRV6]` controls: saved settings `startup_quantize`, `startup_tempo` (0-3 = +-6/10/16/50 %), `startup_time` (TIME/REMAIN), `xf_curve` (smooth = constant power / sharp cut = additive, steepest), `load_block` (also read by `WTrackTableView::loadSelectedTrackToGroup`, overriding the Preferences setting), `sleep` (off/5/10/15/30/60 min); actions `sleep_now`, `power_off` (hold 5 s: stops all decks, starts `sleep 15; sudo -n /usr/sbin/poweroff || systemctl poweroff` and closes Mixxx normally so settings are saved); `theme`/`accent` (written as the skin colour scheme name in [Config],Scheme, then the skin is reloaded); USB sticks `usbN_state/size_gb/free_gb/used/deck/fail/eject` (N = 1-4) from `QStorageInfo` (sticks mounted under /media or /run/media), eject = unload decks that hold a track from the stick (refused while one plays), then `udisksctl unmount` (fallback `sudo -n umount`) and `udisksctl power-off`. Startup defaults are applied after the first skin load; the time readout after every skin load. Sleep uses the X server's own screen saver (`ScreenSaverHelper::grv6SetSleepTimeout` / `grv6SleepNow`, new, plain Xlib calls next to Mixxx's existing `XResetScreenSaver` use): the screen goes black, touch and controller input wake it, and a timer resets it every 20 s while a deck plays.
39. grv6-settings-fixes: after the first test of #38. New saved `[GRV6],startup_keylock` (master tempo at startup, applied with the other startup defaults). Sleep steps are now OFF/10/30/60/90 minutes. SLEEP NOW acts 0.8 s after the button is released (lifting the finger is touch input and woke the screen straight away). POWER OFF now covers the window with GRV6/images/shutdown.png, sets it as the X desktop background with `feh` (if installed) so it stays visible after Mixxx's window closes, writes /tmp/grv6-poweroff (~/.xinitrc does not restart Mixxx while it exists; Mixxx removes it when it starts) and powers off as soon as Mixxx has exited (at most 30 s).

### Testing and scope

- Checked here: all thirty-one apply cleanly, in this exact order, on the unpatched Debian source (fresh extraction, tested end to end); and the thirty-eight of `series-stable3` (39 minus #18) apply cleanly on a fresh extraction too. Not checked here: compiling (that is what the GitHub build does) or hearing/using any of it (that is what the Pi does).
- Left out on purpose: everything that only serves the Pioneered touch skin, browse-bpm-column, jog-nudge (DDJ-400), browse-encoder-zoom (superseded by #19, done live instead of via Preferences).
