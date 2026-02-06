export class MIDIPlayer {
  soundFontURL = "https://soundfonts.pages.dev/GeneralUser_GS_v1.471";
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
  isPlaying = false;
  isPausing = false;
  isPaused = false;
  isStopping = false;
  isSeeking = false;

  constructor(midy) {
    this.midy = midy;
    this.root = document.createElement("midi-player");
  }

  defaultLayout() {
    const div = this.row();
    div.appendChild(this.playPauseResume());
    div.appendChild(this.volume());
    div.appendChild(this.repeat());
    div.appendChild(this.speed());
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
    this.stopTimer();
    const update = () => {
      const now = this.midy.currentTime();
      if (this.currTimeNode) {
        const seconds = Math.ceil(now);
        this.currTimeNode.textContent = this.formatTime(seconds);
      }
      if (this.seekBarNode) {
        this.seekBarNode.value = now / endTime;
      }
      this.timer = requestAnimationFrame(update);
    };
    this.timer = requestAnimationFrame(update);
  }

  stopTimer() {
    if (this.timer) {
      cancelAnimationFrame(this.timer);
      this.timer = null;
    }
  }

  async loadMIDI(file) {
    await this.midy.loadMIDI(file);
    if (this.totalTimeNode) {
      this.totalTimeNode.textContent = this.formatTime(this.midy.totalTime);
    }
  }

  setSoundFontDir(dir) {
    this.soundFontURL = dir;
  }

  getSoundFontPaths() {
    const paths = [];
    const { midy, soundFontURL } = this;
    for (const instrument of midy.instruments) {
      const [bank, program] = instrument.split(":");
      const bankNumber = Number(bank);
      const programNumber = Number(program);
      const index = midy.soundFontTable[programNumber][bankNumber];
      if (index !== undefined) continue;
      const baseName = bankNumber === 128 ? "128" : program;
      paths.push(`${soundFontURL}/${baseName}.sf3`);
    }
    return paths;
  }

  async start() {
    this.isPlaying = true;
    const midy = this.midy;
    await midy.loadSoundFont(this.getSoundFontPaths());
    this.startTimer();
    await midy.start();
    this.stopTimer();
    this.isPlaying = false;
    if (!midy.isPaused && this.currTimeNode) {
      this.currTimeNode.textContent = "0:00";
      this.seekBarNode.value = 0;
    }
  }

  async handleStop() {
    const midy = this.midy;
    if (!midy.isPlaying) return;
    this.isStopping = true;
    this.playNode.style.display = "initial";
    this.pauseNode.style.display = "none";
    this.resumeNode.style.display = "none";
    this.stopTimer();
    await midy.stop();
    this.isPlaying = false;
  }

  stop() {
    const stop = this.button("start", "midi-player-start", "stop", "initial");
    stop.onclick = () => this.handleStop();
    this.stopNode = stop;
    return stop;
  }

  async handlePlay() {
    const { midy, playNode, pauseNode } = this;
    if (midy.isPlaying || midy.isPaused) return;
    this.isPlaying = true;
    playNode.style.display = "none";
    pauseNode.style.display = "initial";
    await this.start();
    this.isPlaying = false;
    if (!midy.isPaused) {
      pauseNode.style.display = "none";
      playNode.style.display = "initial";
    }
  }

  async handlePause() {
    const midy = this.midy;
    if (!midy.isPlaying || midy.isPaused) return;
    this.isPausing = true;
    this.pauseNode.style.display = "none";
    this.resumeNode.style.display = "initial";
    this.stopTimer();
    await midy.pause();
    this.isPausing = false;
    this.isPaused = true;
  }

  async handleResume() {
    const { midy, playNode, pauseNode, resumeNode } = this;
    if (!midy.isPaused) return;
    this.isPlaying = true;
    pauseNode.style.display = "initial";
    resumeNode.style.display = "none";
    this.startTimer();
    await midy.resume();
    this.stopTimer();
    this.isPlaying = false;
    if (!midy.isPaused) {
      pauseNode.style.display = "none";
      playNode.style.display = "initial";
    }
  }

  playPauseResume() {
    const play = this.button(
      "start",
      "midi-player-start",
      "play_arrow",
      "initial",
    );
    const pause = this.button("pause", "midi-player-pause", "pause", "none");
    const resume = this.button(
      "resume",
      "midi-player-resume",
      "play_arrow",
      "none",
    );
    this.playNode = play;
    this.pauseNode = pause;
    this.resumeNode = resume;
    play.onclick = () => this.handlePlay();
    pause.onclick = () => this.handlePause();
    resume.onclick = () => this.handleResume();
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.appendChild(play);
    div.appendChild(pause);
    div.appendChild(resume);
    return div;
  }

  volumeText() {
    return this.text("volume", "midi-player-volumeText");
  }

  volume() {
    const muteOn = this.button(
      "mute ON",
      "midi-player-muteOn",
      "volume_down",
      "initial",
    );
    const muteOff = this.button(
      "mute OFF",
      "midi-player-muteOff",
      "volume_off",
      "none",
    );
    const volumeBar = this.formRange(
      "volume",
      "midi-player-volume",
      100 / 128,
      "none",
    );
    muteOn.onclick = () => {
      muteOn.style.display = "none";
      muteOff.style.display = "initial";
      this.midy.setMasterVolume(0);
    };
    muteOff.onclick = () => {
      muteOn.style.display = "initial";
      muteOff.style.display = "none";
      this.midy.setMasterVolume(Number(volumeBar.value));
    };
    volumeBar.oninput = (event) => {
      this.midy.setMasterVolume(event.target.value);
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

  speed() {
    const speedButton = this.button(
      "reset speed",
      "midi-player-speed",
      "speed",
      "initial",
    );
    const speedBar = this.formRange("playback speed", "midi-player-speed", 0.5, "none");
    speedButton.onclick = () => {
      speedBar.value = 0.5;
      this.midy.tempoChange(1);
      this.stopTimer();
      this.startTimer();
      if (this.totalTimeNode) {
        this.totalTimeNode.textContent = this.formatTime(this.midy.totalTime);
      }
    };
    speedBar.onchange = (event) => {
      const value = Number(event.target.value);
      const min = 0.5;
      const max = 2;
      const tempo = min * Math.pow(max / min, value);
      this.midy.tempoChange(tempo);
      this.stopTimer();
      this.startTimer();
      if (this.totalTimeNode) {
        this.totalTimeNode.textContent = this.formatTime(this.midy.totalTime);
      }
    };
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.appendChild(speedButton);
    div.appendChild(speedBar);
    div.onmouseover = () => {
      speedBar.style.display = "initial";
    };
    div.onmouseout = () => {
      speedBar.style.display = "none";
    };
    return div;
  }

  repeat() {
    const repeatOn = this.button(
      "repeat ON",
      "midi-player-repeatOn",
      "turn_right",
      "initial",
    );
    const repeatOff = this.button(
      "repeat OFF",
      "midi-player-repeatOff",
      "repeat",
      "none",
    );
    repeatOn.onclick = () => {
      repeatOn.style.display = "none";
      repeatOff.style.display = "initial";
      this.midy.loop = true;
    };
    repeatOff.onclick = () => {
      repeatOn.style.display = "initial";
      repeatOff.style.display = "none";
      this.midy.loop = false;
    };
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.appendChild(repeatOn);
    div.appendChild(repeatOff);
    return div;
  }

  seekBar() {
    const seekBar = this.formRange(
      "playback position",
      "midi-player-seekBar",
      0,
      "initial",
    );
    seekBar.oninput = (event) => {
      this.isSeeking = true;
      const time = event.target.value * this.midy.totalTime;
      this.midy.seekTo(time);
      if (this.currTimeNode) {
        this.currTimeNode.textContent = this.formatTime(time);
      }
      this.isSeeking = false;
    };
    this.seekBarNode = seekBar;
    return seekBar;
  }

  currTime() {
    const currTime = this.text("0:00", "midi-player-currTime");
    this.currTimeNode = currTime;
    return currTime;
  }

  totalTime() {
    const totalTime = this.text("0:00", "midi-player-totalTime");
    this.totalTimeNode = totalTime;
    return totalTime;
  }

  currTimeTotalTime() {
    const currTime = this.currTime();
    const separator = this.text("/", "midi-player-timeSeparator");
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
