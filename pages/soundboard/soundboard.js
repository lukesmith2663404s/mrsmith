(() => {
  "use strict";

  const KEYBOARD_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"]
  ];

  const sounds = Array.isArray(globalThis.SOUNDBOARD_SOUNDS)
    ? globalThis.SOUNDBOARD_SOUNDS
    : [];

  const keyboard = document.getElementById("keyboard");
  const status = document.getElementById("soundboardStatus");
  const volumeSlider = document.getElementById("volumeSlider");
  const stopAllButton = document.getElementById("stopAllButton");

  const soundByKey = new Map();
  const audioByKey = new Map();
  const buttonByKey = new Map();
  const releaseTimers = new Map();

  let volume = Number(volumeSlider.value) / 100;

  initialiseSounds();
  renderKeyboard();
  bindEvents();

  function initialiseSounds() {
    sounds.forEach((rawSound) => {
      const key = String(rawSound?.key || "").trim().toUpperCase();

      if (!/^[A-Z]$/.test(key) || soundByKey.has(key)) {
        return;
      }

      const name = String(rawSound?.name || key).trim() || key;
      const sources = normaliseSources(rawSound);

      if (sources.length === 0) {
        return;
      }

      const sound = Object.freeze({ key, name, sources });
      soundByKey.set(key, sound);
      audioByKey.set(key, createAudioState(sound));
    });
  }

  function normaliseSources(rawSound) {
    const values = Array.isArray(rawSound?.sources)
      ? rawSound.sources
      : [rawSound?.src];

    return [...new Set(
      values
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    )];
  }

  function createAudioState(sound) {
    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = volume;

    const state = {
      audio,
      sound,
      sourceIndex: 0,
      unavailable: false
    };

    audio.addEventListener("error", () => {
      tryNextSource(state);
    });

    audio.addEventListener("ended", () => {
      releaseKey(sound.key);
    });

    audio.src = sound.sources[0];

    return state;
  }

  function tryNextSource(state) {
    state.sourceIndex += 1;

    if (state.sourceIndex < state.sound.sources.length) {
      state.audio.src = state.sound.sources[state.sourceIndex];
      state.audio.load();
      return;
    }

    state.unavailable = true;
    const button = buttonByKey.get(state.sound.key);
    button?.classList.add("is-missing");
    button?.setAttribute(
      "aria-label",
      `${state.sound.key}: ${state.sound.name}. Audio file unavailable.`
    );

    setStatus(`Could not find the audio file for ${state.sound.name}.`, true);
  }

  function renderKeyboard() {
    const fragment = document.createDocumentFragment();

    KEYBOARD_ROWS.forEach((rowKeys, rowIndex) => {
      const row = document.createElement("div");
      row.className = `keyboard-row keyboard-row-${rowIndex + 1}`;

      rowKeys.forEach((key) => {
        row.append(createKey(key));
      });

      fragment.append(row);
    });

    keyboard.replaceChildren(fragment);
  }

  function createKey(key) {
    const sound = soundByKey.get(key);
    const wrapper = document.createElement("div");
    wrapper.className = "sound-key-wrapper";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "sound-key";
    button.dataset.key = key;

    const keyLetter = document.createElement("span");
    keyLetter.className = "sound-key-letter";
    keyLetter.textContent = key;
    button.append(keyLetter);

    const soundName = document.createElement("span");
    soundName.className = "sound-key-name";

    if (sound) {
      wrapper.classList.add("has-sound");
      button.setAttribute("aria-label", `${key}: ${sound.name}`);
      soundName.textContent = sound.name;
      button.addEventListener("click", () => playSound(key));
      buttonByKey.set(key, button);
    } else {
      wrapper.classList.add("is-unassigned");
      button.disabled = true;
      button.setAttribute("aria-label", `${key}: no sound assigned`);
      soundName.textContent = "";
    }

    wrapper.append(button, soundName);
    return wrapper;
  }

  function bindEvents() {
    document.addEventListener("keydown", (event) => {
      if (
        event.repeat ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      ) {
        return;
      }

      if (
        event.code === "Space" ||
        event.key === " "
      ) {
        event.preventDefault();
        stopAllSounds();
        return;
      }

      const key = String(event.key || "").toUpperCase();

      if (!soundByKey.has(key)) {
        return;
      }

      event.preventDefault();
      playSound(key);
    });

    volumeSlider.addEventListener("input", () => {
      volume = Number(volumeSlider.value) / 100;

      audioByKey.forEach(({ audio }) => {
        audio.volume = volume;
      });
    });

    stopAllButton.addEventListener("click", stopAllSounds);
  }

  async function playSound(key) {
    const state = audioByKey.get(key);

    if (!state || state.unavailable) {
      setStatus(`No available sound is assigned to ${key}.`, true);
      return;
    }

    const { audio, sound } = state;

    try {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = volume;
      await audio.play();

      pressKey(key);
      setStatus(`${key} — ${sound.name}`);
    } catch (error) {
      if (state.sourceIndex + 1 < sound.sources.length) {
        tryNextSource(state);
        window.setTimeout(() => playSound(key), 40);
        return;
      }

      setStatus(
        `The browser could not play ${sound.name}. Check the audio file.`,
        true
      );
    }
  }

  function pressKey(key) {
    const button = buttonByKey.get(key);

    if (!button) {
      return;
    }

    window.clearTimeout(releaseTimers.get(key));
    button.classList.remove("is-playing");
    void button.offsetWidth;
    button.classList.add("is-playing");

    releaseTimers.set(
      key,
      window.setTimeout(() => releaseKey(key), 360)
    );
  }

  function releaseKey(key) {
    window.clearTimeout(releaseTimers.get(key));
    releaseTimers.delete(key);
    buttonByKey.get(key)?.classList.remove("is-playing");
  }

  function stopAllSounds() {
    audioByKey.forEach(({ audio }, key) => {
      audio.pause();
      audio.currentTime = 0;
      releaseKey(key);
    });

    setStatus("All sounds stopped.");
  }

  function setStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  }
})();
