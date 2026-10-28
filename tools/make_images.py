"""Generates the PNG assets of the GRV6 skin (icons, meter bars, Settings tab parts).
One set per colour scheme, in GRV6/images/<scheme folder>/ (see tools/themes.py); the skin picks the set through the
scheme variable "img". The splash logo stays at GRV6/images/logo.png.
Run:  python tools/make_images.py   (needs Pillow)"""
import os
import shutil

from PIL import Image, ImageDraw, ImageFont

from themes import image_palette, schemes

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "GRV6", "images")
os.makedirs(ROOT, exist_ok=True)
S = 4  # supersampling

GREEN = (53, 196, 100, 255)
RED = (225, 30, 39, 255)
OUT = ROOT
P = {}


def rgba(c):
    return tuple(int(v) for v in c[:3]) + (255,)


def canvas(w, h):
    return Image.new("RGBA", (w * S, h * S), (0, 0, 0, 0))


def save(img, name, w, h):
    img.resize((w, h), Image.LANCZOS).save(os.path.join(OUT, name))


def font(size):
    return ImageFont.load_default(size=size * S)


def rrect(d, box, radius, fill=None, outline=None, width=1):
    x0, y0, x1, y1 = [v * S for v in box]
    d.rounded_rectangle([x0, y0, x1 - 1, y1 - 1], radius=radius * S, fill=fill, outline=outline, width=width * S)


def onair(on):
    # broadcast/"on air" glyph: a dot with two concentric signal arcs on each side.
    c = RED if on else rgba(P["dim"])
    img = canvas(46, 46)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, 46 * S - 1, 46 * S - 1], radius=7 * S, outline=c, width=2 * S)
    cx, cy = 23 * S, 25 * S
    d.ellipse([cx - 3 * S, cy - 3 * S, cx + 3 * S, cy + 3 * S], fill=c)
    for r in (7, 12):
        bbox = [cx - r * S, cy - r * S, cx + r * S, cy + r * S]
        d.arc(bbox, start=200, end=340, fill=c, width=2 * S)
        d.arc(bbox, start=20, end=160, fill=c, width=2 * S)
    save(img, "onair_on.png" if on else "onair_off.png", 46, 46)


def cue(on):
    c = rgba(P["accent"]) if on else rgba(P["dim"])
    img = canvas(46, 46)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, 46 * S - 1, 46 * S - 1], radius=7 * S, outline=c, width=2 * S)
    d.rectangle([8 * S, 13 * S, 38 * S, 33 * S], fill=rgba(P["black"]))
    d.rectangle([12 * S, 21 * S, 34 * S, 26 * S], fill=c)
    save(img, "cue_on.png" if on else "cue_off.png", 46, 46)


def play(on):
    c = GREEN if on else rgba(P["green_dim"])
    img = canvas(46, 46)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, 46 * S - 1, 46 * S - 1], radius=7 * S, fill=rgba(P["panel"]),
                        outline=rgba(P["edge"]), width=1 * S)
    d.polygon([(19 * S, 12 * S), (19 * S, 34 * S), (36 * S, 23 * S)], fill=c)
    save(img, "play_on.png" if on else "play_off.png", 46, 46)


def flat(name, w, h, c):
    Image.new("RGBA", (w, h), rgba(c)).save(os.path.join(OUT, name))


def meter(name, w, h, horizontal):
    # grey -> white, then orange when close to clipping, red at clipping (fill is clipped by the level).
    # A level meter, so the same in every scheme.
    stops = [(0.00, (78, 84, 94)), (0.70, (228, 231, 236)), (0.72, (242, 150, 40)), (0.88, (242, 150, 40)),
             (0.90, (230, 50, 40)), (1.00, (230, 50, 40))]
    img = Image.new("RGBA", (w, h))
    px = img.load()
    for y in range(h):
        for x in range(w):
            t = (x / max(1, w - 1)) if horizontal else (1 - y / max(1, h - 1))
            for (a, ca), (b, cb) in zip(stops, stops[1:]):
                if a <= t <= b:
                    k = 0 if b == a else (t - a) / (b - a)
                    px[x, y] = tuple(int(ca[i] + (cb[i] - ca[i]) * k) for i in range(3)) + (255,)
                    break
    img.save(os.path.join(OUT, name))


def settings_assets():
    # Settings tab (from the design): EQ fader track and cap, on/off switch, record button.
    img = canvas(86, 270)  # the cap is wider than the track, like in the design
    d = ImageDraw.Draw(img)
    rrect(d, (7, 0, 79, 270), 4, fill=rgba(P["track"]), outline=rgba(P["edge"]))
    d.rectangle([7 * S, 135 * S, 79 * S - 1, 136 * S - 1], fill=rgba(P["cap"]))
    save(img, "eq_fader_track.png", 86, 270)
    img = canvas(86, 28)
    d = ImageDraw.Draw(img)
    rrect(d, (0, 0, 86, 28), 3, fill=rgba(P["cap"]), outline=rgba(P["cap_edge"]))
    d.rectangle([9 * S, 13 * S, 77 * S - 1, 15 * S - 1], fill=rgba(P["cap_line"]))
    save(img, "eq_fader_handle.png", 86, 28)

    for on in (False, True):  # on/off switch 104x56
        img = canvas(104, 56)
        d = ImageDraw.Draw(img)
        if on:
            rrect(d, (0, 0, 104, 56), 6, fill=rgba(P["accent"]), outline=rgba(P["accent"]))
            rrect(d, (52, 4, 98, 50), 4, fill=rgba(P["sw_knob"]))
            d.text((26 * S, 28 * S), "ON", fill=(10, 10, 11, 255), font=font(13), anchor="mm")
        else:
            rrect(d, (0, 0, 104, 56), 6, fill=rgba(P["panel"]), outline=rgba(P["sw_off_edge"]))
            rrect(d, (4, 4, 50, 50), 4, fill=rgba(P["dim"]))
            d.text((78 * S, 28 * S), "OFF", fill=rgba(P["sw_off_text"]), font=font(13), anchor="mm")
        save(img, "sw_on.png" if on else "sw_off.png", 104, 56)

    for on in (False, True):  # record button 150x120: red dot + REC, red square + STOP while recording
        img = canvas(150, 120)
        d = ImageDraw.Draw(img)
        if on:
            rrect(d, (0, 0, 150, 120), 6, fill=rgba(P["rec_on"]), outline=RED)
            rrect(d, (62, 27, 88, 53), 3, fill=RED)
        else:
            rrect(d, (0, 0, 150, 120), 6, fill=rgba(P["rec_off"]), outline=rgba(P["rec_off_edge"]))
            d.ellipse([60 * S, 25 * S, 90 * S, 55 * S], fill=RED)
        d.text((75 * S, 88 * S), "STOP" if on else "REC", fill=rgba(P["rec_text"]), font=font(16), anchor="mm")
        save(img, "rec_on.png" if on else "rec_off.png", 150, 120)


def one_scheme():
    for on in (True, False):
        cue(on)
        play(on)
        onair(on)
    meter("vu_main.png", 130, 7, True)           # master L/R, horizontal
    flat("vu_main_bg.png", 130, 7, P["meter_bg"])
    meter("vu_deck.png", 6, 172, False)          # channel L/R, vertical
    flat("vu_deck_bg.png", 6, 172, P["meter_bg"])
    flat("cpu.png", 96, 8, P["accent"])          # audio latency usage
    flat("cpu_bg.png", 96, 8, P["meter_bg"])
    flat("progress_strip.png", 230, 6, P["accent"])   # 30px strip under each deck
    flat("progress_strip_bg.png", 230, 6, P["meter_bg"])
    flat("progress_card.png", 320, 6, P["accent"])    # Browse deck cards
    flat("progress_card_bg.png", 320, 6, P["meter_bg"])
    flat("usb_used.png", 48, 6, P["dim"])             # Settings tab USB rows: used space
    flat("usb_used_bg.png", 48, 6, P["meter_bg"])
    settings_assets()


# Pictures from before the colour schemes lived directly in images/; they are now per scheme.
for name in os.listdir(ROOT):
    path = os.path.join(ROOT, name)
    if os.path.isfile(path) and name.endswith(".png") and name != "logo.png":
        os.remove(path)

for _, folder, mode, accent in schemes():
    OUT = os.path.join(ROOT, folder)
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)
    P = image_palette(mode, accent)
    one_scheme()

# Placeholder splash logo. Replace GRV6/images/logo.png with the real logo; this only writes it when it is missing.
logo_path = os.path.join(ROOT, "logo.png")
if not os.path.exists(logo_path):
    logo = Image.new("RGBA", (640, 200), (0, 0, 0, 0))
    d = ImageDraw.Draw(logo)
    d.text((320, 100), "GRV6", fill=(210, 103, 15, 255), font=ImageFont.load_default(size=120), anchor="mm")
    logo.save(logo_path)
# Shutdown picture: shown full screen by POWER OFF (stable 3 patch #39) until the power is off. Replace
# GRV6/images/shutdown.png with your own 1920x1080 picture if you like; this only writes it when it is missing.
shutdown_path = os.path.join(ROOT, "shutdown.png")
if not os.path.exists(shutdown_path):
    pic = Image.new("RGBA", (1920, 1080), (5, 5, 6, 255))
    d = ImageDraw.Draw(pic)
    logo_file = os.path.join(ROOT, "logo.png")
    if os.path.exists(logo_file):
        logo = Image.open(logo_file).convert("RGBA")
        pic.alpha_composite(logo, ((1920 - logo.width) // 2, 440 - logo.height // 2))
    d.text((960, 640), "SHUTTING DOWN", fill=(113, 116, 123, 255), font=ImageFont.load_default(size=40), anchor="mm")
    pic.convert("RGB").save(shutdown_path)

print("images ->", os.path.abspath(ROOT), "(%d schemes)" % len(schemes()))
