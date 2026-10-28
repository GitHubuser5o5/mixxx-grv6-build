"""Colour themes of the GRV6 skin, shared by build_skin.py (stylesheets) and make_images.py (pictures).

A theme is DARK or LIGHT plus an accent colour. Each combination is a Mixxx skin colour scheme named like
"Dark Orange" (that name is what Mixxx stores in [Config],Scheme and what the Settings tab switches between,
see mixxx-build/patches/grv6-settings-system.patch). GRV6/style.qss is written for Dark Orange and is the
template for all of them: every other scheme is made by swapping its colours (see qss_colour_map)."""

ACCENTS = [  # name, main colour; the order is the [GRV6],accent value 0-4 and the swatch order on the Settings tab
    ("Orange", (210, 103, 15)),
    ("Green", (39, 168, 90)),
    ("Blue", (47, 128, 216)),
    ("Red", (214, 58, 58)),
    ("Purple", (141, 85, 217)),
]
MODES = ["Dark", "Light"]  # [GRV6],theme 0 / 1


def schemes():
    """[(scheme name, folder name, mode index, accent index)], Dark Orange first (Mixxx falls back to the first)."""
    out = []
    for m, mode in enumerate(MODES):
        for a, (accent, _) in enumerate(ACCENTS):
            out.append((f"{mode} {accent}", f"{mode.lower()}_{accent.lower()}", m, a))
    return out


def hexc(rgb):
    return "#%02x%02x%02x" % tuple(int(round(max(0, min(255, c)))) for c in rgb[:3])


def scale(rgb, k):
    return tuple(c * k for c in rgb)


def mix(rgb, other, k):
    """k of rgb, 1-k of other."""
    return tuple(a * k + b * (1 - k) for a, b in zip(rgb, other))


WHITE = (255, 255, 255)

# Dark Orange's accent-derived colours (as used in style.qss) and how each is made from the accent, per mode.
ACCENT_ROLES = {
    "#d2670f": (lambda a: a, lambda a: a),                                         # accent
    "#7a3c09": (lambda a: scale(a, 0.58), lambda a: mix(a, WHITE, 0.55)),          # accent-dark (borders)
    "#1d1006": (lambda a: scale(a, 0.14), lambda a: mix(a, WHITE, 0.14)),          # accent-deep (tinted fills)
    "#a05408": (lambda a: scale(a, 0.76), lambda a: scale(a, 0.80)),               # dimmed accent text
    "#5a300a": (lambda a: scale(a, 0.43), lambda a: mix(a, WHITE, 0.45)),          # dim accent border
    "#2a1b0f": (lambda a: mix(a, (13, 14, 17), 0.17), lambda a: mix(a, WHITE, 0.22)),   # selected-but-disabled fill
    "#6b4c30": (lambda a: mix(a, (60, 63, 69), 0.35), lambda a: mix(a, (150, 150, 150), 0.55)),  # its text
    "#f0d9c6": (lambda a: mix(a, WHITE, 0.2), lambda a: mix(a, WHITE, 0.2)),       # light tint
    "#64320a": (lambda a: scale(a, 0.48), lambda a: mix(a, WHITE, 0.45)),          # EQ fader fill (settings.xml)
}

# Neutral colours of style.qss -> light theme. Not listed = same in both themes (reds, green, text on accent).
LIGHT_NEUTRALS = {
    "#050506": "#d9dce2",  # ground
    "#0d0e11": "#f5f6f8",  # panel
    "#1b1d22": "#c6cad1",  # edge
    "#e9e9ed": "#17181c",  # text
    "#71747b": "#5c6068",
    "#63666d": "#686c74",
    "#5a5d64": "#6c7078",
    "#4a4d54": "#80848c",
    "#3c3f45": "#9a9ea6",
    "#8a8d92": "#50545b",
    "#6e7178": "#5c6068",
    "#a9acb3": "#4f535a",
    "#c7cad0": "#2a2c31",
    "#2f3237": "#b9bdc4",
    "#0a0a0c": "#ffffff",  # track table
    "#17181c": "#e1e4e9",
    "#0e0f12": "#eceef2",
    "#1d1f24": "#dde0e5",
    "#101115": "#e6e8ec",
    "#0b0c0e": "#e8eaee",
    "#08090a": "#eef0f3",
    "#2a2c31": "#c3c7ce",
    "#131418": "#e9ebef",
    "#0f0708": "#fbeeee",  # record / power button fills
    "#3a1013": "#f1c4c6",
    "#5a1014": "#e8a7aa",
    "#1f5a33": "#8fd3a6",  # USB row "safe to remove"
    "#08140c": "#e8f7ed",
}


def qss_colour_map(mode, accent):
    """{dark-orange hex: hex for this scheme} for every colour that changes."""
    a = ACCENTS[accent][1]
    out = {}
    for src, (dark, light) in ACCENT_ROLES.items():
        out[src] = hexc((light if mode == 1 else dark)(a))
    if mode == 1:
        out.update(LIGHT_NEUTRALS)
    return out


# Picture palettes (RGB) for make_images.py.
def image_palette(mode, accent):
    a = ACCENTS[accent][1]
    if mode == 0:
        return dict(
            accent=a, dim=(60, 63, 69), panel=(19, 20, 24), edge=(27, 29, 34), black=(5, 5, 6),
            meter_bg=(21, 22, 26), track=(8, 9, 10), cap=(42, 44, 49), cap_edge=(69, 72, 79),
            cap_line=(233, 233, 237), sw_off_edge=(42, 44, 49), sw_off_text=(90, 93, 100), sw_knob=(5, 5, 6),
            rec_off=(15, 7, 8), rec_off_edge=(90, 16, 20), rec_on=(28, 7, 9), rec_text=(233, 233, 237),
            green_dim=(47, 50, 55))
    return dict(
        accent=a, dim=(163, 166, 173), panel=(236, 238, 241), edge=(198, 202, 209), black=(232, 234, 238),
        meter_bg=(214, 217, 223), track=(231, 233, 237), cap=(205, 208, 214), cap_edge=(160, 164, 171),
        cap_line=(23, 24, 28), sw_off_edge=(195, 199, 206), sw_off_text=(110, 114, 122), sw_knob=(255, 255, 255),
        rec_off=(251, 238, 238), rec_off_edge=(232, 167, 170), rec_on=(248, 220, 221), rec_text=(23, 24, 28),
        green_dim=(205, 208, 214))


def xml_variables(mode, accent):
    """Variables a scheme sets for the XML templates (skin.xml <Schemes>, read with <Variable name="..."/>)."""
    colours = qss_colour_map(mode, accent)
    folder = f"{MODES[mode].lower()}_{ACCENTS[accent][0].lower()}"
    v = {
        "img": f"images/{folder}",                 # picture folder
        "accent": colours["#d2670f"],              # waveform cue / loop marks
        "accent_fill": colours["#64320a"],         # EQ fader fill
    }
    if mode == 0:
        v.update(wave_bg="#08090a", wave_beat="#33e4e7ec", wave_playpos="#e4e7ec",
                 ov_bg="#0b0c0e", ov_playpos="#e4e7ec", ov_played="#a8030304", ov_minute="#3c3f45",
                 row_tint="0.35", card_tint="255")
    else:
        # light: waveforms on a light ground; no track-colour tint on rows and deck cards (tracks without a colour
        # are stored as black and turned rows grey and the Browse deck card black)
        v.update(wave_bg="#eef0f3", wave_beat="#3317181c", wave_playpos="#17181c",
                 ov_bg="#e8eaee", ov_playpos="#17181c", ov_played="#a8ffffff", ov_minute="#9a9ea6",
                 row_tint="0", card_tint="0")
    return v
