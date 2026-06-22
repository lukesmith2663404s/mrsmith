/*
  Timer options.

  Music is generated separately by tools/update_timer_music.py so new tracks
  can be added by putting files in assets/music and running
  update-timer-music.bat.
*/

(() => {
  "use strict";

  const fallbackMusic = [
    {
      id: "none",
      label: "No music",
      type: "none",
      durationMode: "none",
      durationSeconds: null,
      src: null
    },
    {
      id: "countdown",
      label: "Countdown",
      type: "standard",
      durationMode: "fixed",
      durationSeconds: 30,
      src: "../../assets/music/countdown.mp3"
    }
  ];

  const music = Array.isArray(globalThis.TIMER_MUSIC_OPTIONS)
    ? globalThis.TIMER_MUSIC_OPTIONS
    : fallbackMusic;

  globalThis.TIMER_OPTIONS = Object.freeze({
    music: Object.freeze(
      music.map((entry) => Object.freeze({ ...entry }))
    ),

    animations: Object.freeze([
      Object.freeze({
        id: "none",
        label: "No animation",
        type: "none",
        durationSeconds: null
      }),
      Object.freeze({
        id: "screen-drain-top",
        label: "Screen drain — from top",
        type: "screen-drain-top",
        durationSeconds: null
      }),
      Object.freeze({
        id: "screen-drain-right",
        label: "Screen drain — from right",
        type: "screen-drain-right",
        durationSeconds: null
      }),
      Object.freeze({
        id: "screen-drain-bottom",
        label: "Screen drain — from bottom",
        type: "screen-drain-bottom",
        durationSeconds: null
      }),
      Object.freeze({
        id: "screen-drain-left",
        label: "Screen drain — from left",
        type: "screen-drain-left",
        durationSeconds: null
      }),
      Object.freeze({
        id: "radial-clock",
        label: "Radial drain",
        type: "radial-clock",
        durationSeconds: null
      }),
      Object.freeze({
        id: "disappearing-circles",
        label: "Disappearing circles",
        type: "disappearing-circles",
        durationSeconds: null
      })
    ])
  });
})();
