import { Midy } from "https://cdn.jsdelivr.net/gh/marmooo/midy@0.0.3/dist/midy.min.js";
import { MIDIPlayer } from "./midi-player.js";
import hljs from "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/es/highlight.min.js";
import javascript from "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/es/languages/javascript.min.js";
import css from "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/es/languages/css.min.js";

const highlightjsURL =
  "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/styles/";
const lightThemeURL = highlightjsURL + "default.min.css";
const darkThemeURL = highlightjsURL + "dark.min.css";

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
    document.getElementById("highlight-theme").href = darkThemeURL;
  } else {
    document.getElementById("highlight-theme").href = lightThemeURL;
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    document.documentElement.setAttribute("data-bs-theme", "light");
    document.getElementById("highlight-theme").href = lightThemeURL;
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.setAttribute("data-bs-theme", "dark");
    document.getElementById("highlight-theme").href = darkThemeURL;
  }
}

function applyTheme(midiPlayer) {
  const root = midiPlayer.root;
  for (const btn of root.getElementsByClassName("midi-player-btn")) {
    btn.classList.add("btn", "btn-light", "p-1");
  }
  for (const btn of root.getElementsByClassName("midi-player-text")) {
    btn.classList.add("p-1");
  }
  for (const btn of root.getElementsByClassName("midi-player-range")) {
    btn.classList.add("form-range", "p-1");
  }
}

function arrangeLayout(midiPlayer) {
  const div = midiPlayer.row();
  div.appendChild(midiPlayer.playPauseResume());
  div.appendChild(midiPlayer.seekBar());
}

async function simpleTest() {
  const midy = new Midy(new AudioContext());
  const midiPlayer = new MIDIPlayer(midy);
  midiPlayer.defaultLayout();
  document.getElementById("simpleTest").appendChild(midiPlayer.root);
  await midiPlayer.loadMIDI("midi/travel.mid");
}

async function stylingTest() {
  const midy = new Midy(new AudioContext());
  const midiPlayer = new MIDIPlayer(midy);
  midiPlayer.defaultLayout();
  applyTheme(midiPlayer);
  document.getElementById("stylingTest").appendChild(midiPlayer.root);
  await midiPlayer.loadMIDI("midi/hitogo2.mid");
}

async function arrangingTest() {
  const midy = new Midy(new AudioContext());
  const midiPlayer = new MIDIPlayer(midy);
  arrangeLayout(midiPlayer);
  applyTheme(midiPlayer);
  document.getElementById("arrangingTest").appendChild(midiPlayer.root);
  await midiPlayer.loadMIDI("midi/0002.mid");
}

loadConfig();
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("css", css);
hljs.highlightAll();

simpleTest();
stylingTest();
arrangingTest();

document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
