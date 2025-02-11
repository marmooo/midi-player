export class MIDIPlayer {
  soundFontDir = "https://soundfonts.pages.dev/GeneralUser_GS_v1.471";
  midy;
  timer;
  currentTime = 0;
  currTimeInterval = 100;
  currTimeNode;
  totalTimeNode;
  seekBarNode;
  playNode;
  pauseNode;
  resumeNode;
  stopNode;

  constructor(midy) {
    this.midy = midy;
    this.root = document.createElement("midi-player");
  }

  defaultLayout() {
    const div = this.row();
    div.appendChild(this.playPauseResume());
    div.appendChild(this.volume());
    div.appendChild(this.currTimeTotalTime());
    div.appendChild(this.seekBar());
  }

  row() {
    const div = document.createElement("div");
    div.className = "midi-player-row";
    div.style.display = "flex";
    div.style.alignItems = "center";
    this.root.appendChild(div);
    return div;
  }

  formatTime(seconds) {
    seconds = Math.floor(seconds);
    const s = seconds % 60;
    const m = (seconds - s) / 60;
    const h = (seconds - s - 60 * m) / 3600;
    const ss = String(s).padStart(2, "0");
    const mm = (m > 9 || !h) ? `${m}:` : `0${m}:`;
    const hh = h ? `${h}:` : "";
    return `${hh}${mm}${ss}`;
  }

  button(title, className, spriteId, display) {
    const div = document.createElement("div");
    div.style.display = display;
    div.innerHTML = `
<button title="${title}" class="midi-player-btn ${className}" type="button">
  ${spriteId}
</button>
`;
    return div;
  }

  formRange(title, className, value, display) {
    const div = document.createElement("div");
    div.innerHTML = `
<input title="${title}" class="midi-player-range ${className}" style="display:${display};"
  type="range" min="0" max="1" step="0.001" value="${value}">
`;
    return div.firstElementChild;
  }

  text(text, className) {
    const div = document.createElement("div");
    div.className = `midi-player-text ${className}`;
    div.textContent = text;
    return div;
  }

  startTimer() {
    const endTime = this.midy.totalTime;
    this.timer = setInterval(() => {
      const now = this.midy.currentTime();
      const seconds = Math.ceil(now);
      if (this.currTimeNode) {
        this.currTimeNode.textContent = this.formatTime(seconds);
      }
      if (this.seekBarNode) {
        this.seekBarNode.value = now / endTime;
      }
    }, this.currTimeInterval);
  }

  async loadMIDI(file) {
    await this.midy.loadMIDI(file);
    if (this.totalTimeNode) {
      this.totalTimeNode.textContent = this.formatTime(this.midy.totalTime);
    }
  }

  setSoundFontDir(dir) {
    this.soundFontDir = dir;
  }

  async start() {
    if (this.midy.soundFonts.length === 0) {
      for (const instrument of this.midy.instruments) {
        const [bankNumber, programNumber] = instrument.split(":").map(Number);
        if (this.midy.soundFontTable[programNumber].has(bankNumber)) continue;
        const program = programNumber.toString().padStart(3, "0");
        if (bankNumber === 128) {
          await this.midy.loadSoundFont(`${this.soundFontDir}/128.sf3`);
        } else {
          await this.midy.loadSoundFont(`${this.soundFontDir}/${program}.sf3`);
        }
      }
    }
    this.startTimer();
    await this.midy.start();
    clearInterval(this.timer);
    if (!this.midy.isPaused && this.currTimeNode) {
      this.currTimeNode.textContent = "0:00";
      this.seekBarNode.value = 0;
    }
  }

  stop() {
    const stop = this.button("start", "start", "stop", "initial");
    stop.onclick = () => {
      if (!this.midy.isPlaying) return;
      clearInterval(this.timer);
      this.playNode.style.display = "initial";
      this.pauseNode.style.display = "none";
      this.resumeNode.style.display = "none";
      this.midy.stop();
    };
    this.stopNode = stop;
    return stop;
  }

  playPauseResume() {
    const play = this.button("start", "start", "play_arrow", "initial");
    const pause = this.button("pause", "pause", "pause", "none");
    const resume = this.button("resume", "resume", "play_arrow", "none");
    play.onclick = async () => {
      if (this.midy.isPlaying || this.midy.isPaused) return;
      play.style.display = "none";
      pause.style.display = "initial";
      await this.start();
      if (!this.midy.isPaused) {
        pause.style.display = "none";
        play.style.display = "initial";
      }
    };
    pause.onclick = () => {
      if (!this.midy.isPlaying || this.midy.isPaused) return;
      pause.style.display = "none";
      resume.style.display = "initial";
      clearInterval(this.timer);
      this.midy.pause();
    };
    resume.onclick = async () => {
      if (!this.midy.isPaused) return;
      pause.style.display = "initial";
      resume.style.display = "none";
      this.startTimer();
      await this.midy.resume();
      clearInterval(this.timer);
      if (!this.midy.isPaused) {
        pause.style.display = "none";
        play.style.display = "initial";
      }
    };
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.appendChild(play);
    div.appendChild(pause);
    div.appendChild(resume);
    this.playNode = play;
    this.pauseNode = pause;
    this.resumeNode = resume;
    return div;
  }

  volumeText() {
    return this.text("volume", "volumeText");
  }

  volume() {
    const muteOn = this.button("mute ON", "muteOn", "volume_down", "initial");
    const muteOff = this.button("mute OFF", "muteOff", "volume_off", "none");
    const volumeBar = this.formRange("volume", "volume", 1, "none");
    muteOn.onclick = () => {
      muteOn.style.display = "none";
      muteOff.style.display = "initial";
      this.midy.handleMasterVolume(0);
    };
    muteOff.onclick = () => {
      muteOn.style.display = "initial";
      muteOff.style.display = "none";
      this.midy.handleMasterVolume(1);
    };
    volumeBar.oninput = (event) => {
      this.midy.handleMasterVolume(event.target.value);
    };
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.appendChild(muteOn);
    div.appendChild(muteOff);
    div.appendChild(volumeBar);
    div.onmouseover = () => {
      volumeBar.style.display = "initial";
    };
    div.onmouseout = () => {
      volumeBar.style.display = "none";
    };
    return div;
  }

  seekBar() {
    const seekBar = this.formRange(
      "playback position",
      "seekBar",
      0,
      "initial",
    );
    seekBar.oninput = (event) => {
      const time = event.target.value * this.midy.totalTime;
      this.midy.seekTo(time);
      if (this.currTimeNode) {
        this.currTimeNode.textContent = this.formatTime(time);
      }
    };
    this.seekBarNode = seekBar;
    return seekBar;
  }

  currTime() {
    const currTime = this.text("0:00", "currTime");
    this.currTimeNode = currTime;
    return currTime;
  }

  totalTime() {
    const totalTime = this.text("0:00", "totalTime");
    this.totalTimeNode = totalTime;
    return totalTime;
  }

  currTimeTotalTime() {
    const currTime = this.currTime();
    const separator = this.text("/", "timeSeparator");
    const totalTime = this.totalTime();
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.appendChild(currTime);
    div.appendChild(separator);
    div.appendChild(totalTime);
    return div;
  }
}
