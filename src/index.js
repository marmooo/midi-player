import { Midy } from "https://cdn.jsdelivr.net/gh/marmooo/midy@0.5.8/dist/midy.min.js";
import { MIDIPlayer } from "./midi-player.js";
import hljs from "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/es/highlight.min.js";
import javascript from "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/es/languages/javascript.min.js";
import css from "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/es/languages/css.min.js";

const highlightjsURL =
  "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/styles/";
const lightThemeURL = highlightjsURL + "default.min.css";
const darkThemeURL = highlightjsURL + "dark.min.css";

applyHighlightjsTheme(document.documentElement.getAttribute("data-bs-theme"));

function toggleDarkMode() {
  const html = document.documentElement;
  const newTheme = html.getAttribute("data-bs-theme") === "dark"
    ? "light"
    : "dark";
  html.setAttribute("data-bs-theme", newTheme);
  localStorage.setItem("darkMode", newTheme);
  applyHighlightjsTheme(newTheme);
}

function applyHighlightjsTheme(theme) {
  document.getElementById("highlightjs-theme").href = theme === "dark"
    ? darkThemeURL
    : lightThemeURL;
}

function buildDocumentStylesheet() {
  const sheet = new CSSStyleSheet();
  let css = "";
  for (const stylesheet of document.styleSheets) {
    try {
      for (const rule of stylesheet.cssRules) {
        css += rule.cssText;
      }
    } catch {
      // skip
    }
  }
  sheet.replaceSync(css);
  return sheet;
}

function arrangeLayout(midiPlayer) {
  const div = midiPlayer.row();
  div.appendChild(midiPlayer.playPauseResume());
  div.appendChild(midiPlayer.seekBar());
}

async function simpleTest() {
  const audioContext = new AudioContext();
  if (audioContext.state === "running") await audioContext.suspend();
  const midy = new Midy(audioContext);
  midy.cacheMode = "chunk";
  const midiPlayer = new MIDIPlayer(midy);
  midiPlayer.defaultLayout();
  document.getElementById("simpleTest").appendChild(midiPlayer.root);
  await midiPlayer.loadMIDI("midi/travel.mid");
}

async function partTest() {
  const audioContext = new AudioContext();
  if (audioContext.state === "running") await audioContext.suspend();
  const midy = new Midy(audioContext);
  midy.cacheMode = "chunk";
  const midiPlayer = new MIDIPlayer(midy);
  midiPlayer.defaultLayout();
  document.getElementById("partTest").appendChild(midiPlayer.root);
  await midiPlayer.loadMIDI("midi/hitogo2.mid");
}

async function stylingTest() {
  const audioContext = new AudioContext();
  if (audioContext.state === "running") await audioContext.suspend();
  const midy = new Midy(audioContext);
  midy.cacheMode = "chunk";
  const midiPlayer = new MIDIPlayer(midy);
  midiPlayer.defaultLayout();
  const sheet = buildDocumentStylesheet();
  midiPlayer.applyTheme(sheet, {
    "midi-player-btn": "btn bg-light-subtle p-1",
    "midi-player-text": "p-1",
    "midi-player-range": "form-range",
  });
  document.getElementById("stylingTest").appendChild(midiPlayer.root);
  await midiPlayer.loadMIDI("midi/hitogo2.mid");
}

async function arrangingTest() {
  const audioContext = new AudioContext();
  if (audioContext.state === "running") await audioContext.suspend();
  const midy = new Midy(audioContext);
  midy.cacheMode = "chunk";
  const midiPlayer = new MIDIPlayer(midy);
  arrangeLayout(midiPlayer);
  const sheet = buildDocumentStylesheet();
  midiPlayer.applyTheme(sheet, {
    "midi-player-btn": "btn bg-light-subtle p-1",
    "midi-player-range": "form-range",
  });
  document.getElementById("arrangingTest").appendChild(midiPlayer.root);
  await midiPlayer.loadMIDI("midi/0002.mid");
}

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("css", css);
hljs.highlightAll();

simpleTest();
partTest();
stylingTest();
arrangingTest();

document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
