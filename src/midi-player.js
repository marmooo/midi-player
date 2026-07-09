const DEFAULT_ICON_PATHS = {
  play: `M320-203v-560l440 280-440 280Z`,
  pause: `M555-200v-560h175v560H555Zm-325 0v-560h175v560H230Z`,
  volumeOn:
    `M560-131v-62q97-28 158.5-107.5T780-481q0-101-61-181T560-769v-62q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm420 48v-337q55 17 87.5 64T660-480q0 57-33 104t-87 64Z`,
  volumeOff:
    `M813-56 681-188q-28 20-60.5 34.5T553-131v-62q23-7 44.5-15.5T638-231L473-397v237L273-360H113v-240h156L49-820l43-43 764 763-43 44Zm-36-232-43-43q20-34 29.5-72t9.5-78q0-103-60-184.5T553-769v-62q124 28 202 125.5T833-481q0 51-14 100t-42 93ZM643-422l-90-90v-130q47 22 73.5 66t26.5 96q0 15-2.5 29.5T643-422ZM473-592 369-696l104-104v208Z`,
  speed:
    `M473.5-303.5Q517-305 537-336l216-339-335 219q-30 20-32 64t21 67q23 23 66.5 21.5ZM478-799q57 0 119 18.5T716-717l-52 37q-45-30-96.5-44.5T477.98-739q-140.47 0-239.23 100.22Q140-538.57 140-396.02 140-351 152.5-305q12.5 46 35.5 85h579q22-36 35-84t13-94q0-42-12.5-90.5T758-578l39-52q38 56 57 112.5T875-404q2 60-12 113t-41 98q-12 23-25.5 28t-33.5 5H192q-17 0-33.5-8.5T134-193q-26-48-40-97.5T80-396q0-83 31.5-156.5t85.5-128Q251-735 323.68-767T478-799Zm-9 331Z`,
  repeatOff:
    `M280-160v-428h446l-90-90 42-42 162 162-162 162-42-42 90-90H340v368h-60Z`,
  repeatOn:
    `M280-80 120-240l160-160 42 44-86 86h464v-160h60v220H236l86 86-42 44Zm-80-450v-220h524l-86-86 42-44 160 160-160 160-42-44 86-86H260v160h-60Z`,
};

function wrapSvg(d) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 -960 960 960"><path d="${d}"/></svg>`;
}

const DEFAULT_STYLE = `
  :host {
    display: block;
  }
  .midi-player-row {
    display: flex;
    align-items: center;
  }
  .midi-player-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    line-height: 1;
  }
  .midi-player-btn svg {
    display: block;
    fill: currentColor;
  }
  .midi-player-range {
    cursor: pointer;
  }
`;

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

  constructor(midy, options = {}) {
    this.midy = midy;
    const defaultIcons = Object.fromEntries(
      Object.entries(DEFAULT_ICON_PATHS).map(([k, d]) => [k, wrapSvg(d)]),
    );
    this.icons = { ...defaultIcons, ...options.icons };
    this.root = document.createElement("midi-player");
    this.shadow = this.root.attachShadow({ mode: "open" });

    const defaultSheet = new CSSStyleSheet();
    defaultSheet.replaceSync(DEFAULT_STYLE);
    this.shadow.adoptedStyleSheets = [defaultSheet];
  }

  applyTheme(stylesheet, classMap = {}) {
    if (
      stylesheet instanceof CSSStyleSheet &&
      !this.shadow.adoptedStyleSheets.includes(stylesheet)
    ) {
      this.shadow.adoptedStyleSheets = [
        ...this.shadow.adoptedStyleSheets,
        stylesheet,
      ];
    }
    for (const [baseClass, extraClasses] of Object.entries(classMap)) {
      for (const el of this.shadow.querySelectorAll(`.${baseClass}`)) {
        for (const cls of extraClasses.split(/\s+/).filter(Boolean)) {
          el.classList.add(cls);
        }
      }
    }
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
    this.shadow.appendChild(div);
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

  button(title, className, iconSvg, display) {
    const div = document.createElement("div");
    div.style.display = display;
    div.innerHTML = `
<button title="${title}" class="midi-player-btn ${className}" part="midi-player-btn ${className}" type="button">
  ${iconSvg}
</button>
`;
    return div;
  }

  formRange(title, className, value, display) {
    const div = document.createElement("div");
    div.innerHTML = `
<input title="${title}" class="midi-player-range ${className}" part="midi-player-range ${className}" style="display:${display};"
  type="range" min="0" max="1" step="0.001" value="${value}">
`;
    return div.firstElementChild;
  }

  text(text, className) {
    const div = document.createElement("div");
    div.className = `midi-player-text ${className}`;
    div.setAttribute("part", `midi-player-text ${className}`);
    div.textContent = text;
    return div;
  }

  startTimer() {
    const endTime = this.midy.totalTime;
    this.stopTimer();
    let lastSeconds = -1;
    const update = () => {
      const now = this.midy.currentTime();
      if (this.currTimeNode) {
        const seconds = Math.ceil(now);
        if (seconds !== lastSeconds) {
          lastSeconds = seconds;
          this.currTimeNode.textContent = this.formatTime(seconds);
        }
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

  destroy() {
    this.stopTimer();
    this.shadow.adoptedStyleSheets = [];
    this.root.remove();
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
    try {
      await midy.loadSoundFont(this.getSoundFontPaths());
      this.startTimer();
      await midy.start();
    } finally {
      this.stopTimer();
      this.isPlaying = false;
      if (!midy.isPaused && this.currTimeNode) {
        this.currTimeNode.textContent = "0:00";
        this.seekBarNode.value = 0;
      }
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
    try {
      await midy.stop();
    } finally {
      this.isStopping = false;
      this.isPlaying = false;
    }
  }

  stop() {
    const stop = this.button(
      "start",
      "midi-player-start",
      this.icons.play,
      "initial",
    );
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
    try {
      await this.start();
    } finally {
      this.isPlaying = false;
      if (!midy.isPaused) {
        pauseNode.style.display = "none";
        playNode.style.display = "initial";
      }
    }
  }

  async handlePause() {
    const midy = this.midy;
    if (!midy.isPlaying || midy.isPaused) return;
    this.isPausing = true;
    this.pauseNode.style.display = "none";
    this.resumeNode.style.display = "initial";
    this.stopTimer();
    try {
      await midy.pause();
      this.isPaused = true;
    } finally {
      this.isPausing = false;
      if (!midy.isPaused) {
        this.pauseNode.style.display = "initial";
        this.resumeNode.style.display = "none";
        this.startTimer();
      }
    }
  }

  async handleResume() {
    const { midy, playNode, pauseNode, resumeNode } = this;
    if (!midy.isPaused) return;
    this.isPlaying = true;
    pauseNode.style.display = "initial";
    resumeNode.style.display = "none";
    this.startTimer();
    try {
      await midy.resume();
    } finally {
      this.stopTimer();
      this.isPlaying = false;
      if (!midy.isPaused) {
        pauseNode.style.display = "none";
        playNode.style.display = "initial";
      }
    }
  }

  playPauseResume() {
    const play = this.button(
      "start",
      "midi-player-start",
      this.icons.play,
      "initial",
    );
    const pause = this.button(
      "pause",
      "midi-player-pause",
      this.icons.pause,
      "none",
    );
    const resume = this.button(
      "resume",
      "midi-player-resume",
      this.icons.play,
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
      this.icons.volumeOn,
      "initial",
    );
    const muteOff = this.button(
      "mute OFF",
      "midi-player-muteOff",
      this.icons.volumeOff,
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
      this.icons.speed,
      "initial",
    );
    const speedBar = this.formRange(
      "playback speed",
      "midi-player-speedBar",
      0.5,
      "none",
    );
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
      this.icons.repeatOff,
      "initial",
    );
    const repeatOff = this.button(
      "repeat OFF",
      "midi-player-repeatOff",
      this.icons.repeatOn,
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
