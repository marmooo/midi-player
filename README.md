# @marmooo/midi-player

`<midi-player>` HTML elements powered by
[Midy](https://github.com/marmooo/midy).

## Demo

- [Basic usage](https://marmooo.github.io/midi-player/)
- [Humidy](https://marmooo.github.io/humidy/) - GM2 MIDI mixer app
- [Timidy](https://marmooo.github.io/timidy/) - Timidity++ style MIDI player

## Usage

1. Import icon font.

```
@font-face {
  font-family: "MIDIPlayerIcons";
  src: url("midi-player-icons.woff2") format("woff2");
}
.midi-player-btn {
  font-family: MIDIPlayerIcons;
  font-size: 24px;
  line-height: 1;
}
```

2. Import the appropriate level of Midy.

```
// import { MidyGMLite as Midy } from "midy/dist/midy-GMLite.min.js";
// import { MidyGM1 as Midy } from "midy/dist/midy-GM1.min.js";
// import { MidyGM2 as Midy } from "midy/dist/midy-GM2.min.js";
import { Midy } from "midy/dist/midy.min.js";

const audioContext = new AudioContext();
if (audioContext.state === "running") await audioContext.suspend();
const midy = new Midy(audioContext);
```

3. Add Player.

```
import { MIDIPlayer } from "@marmooo/midi-player";

const midiPlayer = new MIDIPlayer(midy);
midiPlayer.defaultLayout();
document.getElementById("root").appendChild(midiPlayer.root);
await midiPlayer.midy.loadMIDI("test.mid");
```

## Configuration

### SoundFont

This library supports SF2 and SF3. In addition, it supports multiple soundfonts
and [splitted soundfonts](https://github.com/marmooo/free-soundfonts) that are
optimized for playback on the web. it will automatically use splitted
[GeneralUser GS](https://www.schristiancollins.com/generaluser) for playback,
but you can also set it as follows.

```
const midiPlayer = new MIDIPlayer(midy);
midiPlayer.soundFontURL = "https://soundfonts.pages.dev/GeneralUser_GS_v1.471";
```

```
const midiPlayer = new MIDIPlayer(midy);
await midiPlayer.midy.loadSoundFont("test.sf3")
```

### Layout

All parts can freely change their layout by not using `defaultLayout()`.

```
const midiPlayer = new MIDIPlayer(midy);
const div = midiPlayer.row();
div.appendChild(midiPlayer.playPauseResume());
div.appendChild(midiPlayer.seekBar());
```

### Theme

All parts have midi-player-* class so you can be themed with CSS.

- Basic classes
  - `midi-player-row`
  - `midi-player-btn`
  - `midi-player-range`
  - `midi-player-text`
- Part classes
  - `midi-player-play`
  - `midi-player-pause`
  - `midi-player-resume`
  - `midi-player-stop`
  - `midi-player-currTime`
  - `midi-player-timeSeparator`
  - `midi-player-totalTime`
  - `midi-player-seekBar`
  - `midi-player-volumeOn`
  - `midi-player-volumeff`
  - `midi-player-volumeBar`
  - `midi-player-speed`
  - `midi-player-repeatOn`
  - `midi-player-repeatOff`

You can also style the parts using JavaScript and CSS Framework.

```
const midiPlayer = new MIDIPlayer(midy);
for (const btn of root.getElementsByClassName("midi-player-btn")) {
  btn.classList.add("btn", "btn-light-subtle", "p-1");
}
```

### Icon font

We use [Material Icons](https://github.com/marella/material-icons) licensed
under the
[Apache-2.0](https://github.com/marella/material-icons/blob/main/LICENSE).
Search for the ligature names you want to use from the
[official web app](https://marella.me/material-icons/demo/), save them, and
minimize them using [fontconv](https://github.com/marmooo/fontconv).

```
fontconv --ligature play_arrow,pause,stop,volume_down,volume_off,speed,360,repeat \
  material-icons.woff2 src/midi-player-icons.woff2
```

## License

MIT
