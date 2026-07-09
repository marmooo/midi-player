# @marmooo/midi-player

`<midi-player>` HTML elements powered by
[Midy](https://github.com/marmooo/midy).

## Demo

- [Basic usage](https://marmooo.github.io/midi-player/)
- [Humidy](https://marmooo.github.io/humidy/) - GM2 MIDI mixer app
- [Timidy](https://marmooo.github.io/timidy/) - Timidity++ style MIDI player

## Usage

1. Import the appropriate level of Midy.

```js
// import { MidyGMLite as Midy } from "midy/dist/midy-GMLite.min.js";
// import { MidyGM1 as Midy } from "midy/dist/midy-GM1.min.js";
// import { MidyGM2 as Midy } from "midy/dist/midy-GM2.min.js";
import { Midy } from "midy/dist/midy.min.js";

const audioContext = new AudioContext();
if (audioContext.state === "running") await audioContext.suspend();
const midy = new Midy(audioContext);
```

2. Add player.

```js
import { MIDIPlayer } from "@marmooo/midi-player";

const midiPlayer = new MIDIPlayer(midy);
midiPlayer.defaultLayout();
document.getElementById("root").appendChild(midiPlayer.root);
await midiPlayer.loadMIDI("test.mid");
```

## Configuration

### SoundFont

This library supports SF2 and SF3. It also supports multiple soundfonts and
[split soundfonts](https://github.com/marmooo/free-soundfonts) optimized for web
playback. By default it uses split
[GeneralUser GS](https://www.schristiancollins.com/generaluser), but you can
override it as follows.

```js
const midiPlayer = new MIDIPlayer(midy);
midiPlayer.soundFontURL = "https://soundfonts.pages.dev/GeneralUser_GS_v1.471";
```

```js
const midiPlayer = new MIDIPlayer(midy);
await midiPlayer.midy.loadSoundFont("test.sf3");
```

### Layout

All parts can be arranged freely by building the layout yourself instead of
calling `defaultLayout()`.

```js
const midiPlayer = new MIDIPlayer(midy);
const div = midiPlayer.row();
div.appendChild(midiPlayer.playPauseResume());
div.appendChild(midiPlayer.seekBar());
```

### Icons

Icons are SVG strings. Default icons are built into the library. You can replace
any of them via constructor options — only the keys you specify are overridden.

```js
const midiPlayer = new MIDIPlayer(midy, {
  icons: {
    play: `<svg ...>...</svg>`,
    pause: `<svg ...>...</svg>`,
    volumeOn: `<svg ...>...</svg>`,
    volumeOff: `<svg ...>...</svg>`,
    speed: `<svg ...>...</svg>`,
    repeatOff: `<svg ...>...</svg>`,
    repeatOn: `<svg ...>...</svg>`,
  },
});
```

### Theme

Every element inside the shadow DOM has a `midi-player-*` class and a matching
`part` attribute, so you can style from outside using either CSS `::part` or
`applyTheme()`.

#### Basic classes / parts

| Class / part        | Element                             |
| ------------------- | ----------------------------------- |
| `midi-player-row`   | wrapper `<div>` for each row        |
| `midi-player-btn`   | all `<button>` elements             |
| `midi-player-range` | all `<input type="range">` elements |
| `midi-player-text`  | all text `<div>` elements           |

#### Part classes

| Part                        | Description        |
| --------------------------- | ------------------ |
| `midi-player-start`         | play button        |
| `midi-player-pause`         | pause button       |
| `midi-player-resume`        | resume button      |
| `midi-player-stop`          | stop button        |
| `midi-player-muteOn`        | mute-on button     |
| `midi-player-muteOff`       | mute-off button    |
| `midi-player-volume`        | volume slider      |
| `midi-player-speed`         | speed button       |
| `midi-player-speedBar`      | speed slider       |
| `midi-player-repeatOn`      | repeat-on button   |
| `midi-player-repeatOff`     | repeat-off button  |
| `midi-player-seekBar`       | seek slider        |
| `midi-player-currTime`      | current time text  |
| `midi-player-timeSeparator` | `/` separator text |
| `midi-player-totalTime`     | total time text    |

#### Styling with `::part`

Style the shadow DOM from plain CSS without any JavaScript. Works with any
stylesheet you own.

```css
midi-player::part(midi-player-btn) {
  border: 1px solid #aaa;
  border-radius: 4px;
  padding: 2px;
}
midi-player::part(midi-player-btn):hover {
  background: rgba(0, 0, 0, 0.08);
}
midi-player::part(midi-player-text) {
  padding: 0 4px;
  font-size: 0.85em;
}
```

#### Styling with `applyTheme()` (CSS frameworks)

Pass a `CSSStyleSheet` and a class map to inject framework classes (e.g.
Bootstrap) into the shadow DOM.

`applyTheme()` must be called **after** `defaultLayout()` (or your custom
layout), so that the shadow DOM elements already exist.

In a `type="module"` script, external stylesheets are guaranteed to have loaded
by the time the script runs. In an inline `<script>`, call
`buildDocumentStylesheet()` inside `DOMContentLoaded`.

```js
// Build once and reuse across multiple players.
const sheet = new CSSStyleSheet();
let css = "";
for (const s of document.styleSheets) {
  try {
    for (const r of s.cssRules) css += r.cssText;
  } catch { /* skip cross-origin sheets */ }
}
sheet.replaceSync(css);

const midiPlayer = new MIDIPlayer(midy);
midiPlayer.defaultLayout();
midiPlayer.applyTheme(sheet, {
  "midi-player-btn": "btn bg-light-subtle p-1",
  "midi-player-text": "p-1",
  "midi-player-range": "form-range",
});
document.getElementById("root").appendChild(midiPlayer.root);
await midiPlayer.loadMIDI("test.mid");
```

Passing the same `CSSStyleSheet` instance to multiple players is safe — it is
shared via `adoptedStyleSheets` and added only once per player.

### Cleanup

Call `destroy()` when you no longer need a player. It stops playback, releases
the adopted stylesheets, and removes the element from the DOM.

```js
midiPlayer.destroy();
```

## License

MIT
