(() => {
  "use strict";

  const options = globalThis.TIMER_OPTIONS || {
    music: [],
    animations: []
  };

  const form = document.getElementById("timerSetupForm");
  const durationFieldset = document.getElementById("durationFieldset");
  const hoursInput = document.getElementById("hoursInput");
  const minutesInput = document.getElementById("minutesInput");
  const secondsInput = document.getElementById("secondsInput");
  const musicOptions = document.getElementById("musicOptions");
  const animationOptions = document.getElementById("animationOptions");
  const durationLock = document.getElementById("durationLock");
  const durationLockText = document.getElementById("durationLockText");
  const status = document.getElementById("timerSetupStatus");

  const musicById = new Map();
  const animationById = new Map();

  let manualDurationSeconds = 60;

  initialise().catch((error) => {
    console.error(error);
    setStatus("The timer options could not be loaded.", true);
  });

  async function initialise() {
    setStatus("");

    const music = await hydrateMusic(options.music);
    const animations = normaliseAnimations(options.animations);

    normaliseMusic(music).forEach((entry) => {
      musicById.set(entry.id, entry);
    });

    animations.forEach((entry) => {
      animationById.set(entry.id, entry);
    });

    renderMusic([...musicById.values()]);
    renderAnimations(animations);
    bindEvents();
    updateDurationRules();
    setStatus("");
  }

  async function hydrateMusic(entries) {
    const valid = Array.isArray(entries)
      ? entries.filter((entry) => entry && entry.id)
      : [];

    return Promise.all(valid.map(async (entry) => {
      const copy = { ...entry };

      if (copy.id === "none" || copy.type === "none") {
        return copy;
      }

      if (copy.type === "hurry-up") {
        const [baseDuration, transitionDuration, hurryDuration] = await Promise.all([
          readAudioDuration(copy.baseSrc),
          readAudioDuration(copy.transitionSrc),
          readAudioDuration(copy.hurrySrc)
        ]);

        copy.baseDurationSeconds = baseDuration;
        copy.transitionDurationSeconds = transitionDuration;
        copy.hurryDurationSeconds = hurryDuration;

        if (
          !isPositiveNumber(baseDuration) ||
          !isPositiveNumber(transitionDuration) ||
          !isPositiveNumber(hurryDuration)
        ) {
          copy.unavailable = true;
          return copy;
        }

        copy.minimumDurationSeconds = Math.ceil(
          transitionDuration + hurryDuration
        );
        return copy;
      }

      if (!isPositiveNumber(copy.durationSeconds)) {
        copy.durationSeconds = await readAudioDuration(copy.src);
      }

      if (!isPositiveNumber(copy.durationSeconds)) {
        copy.unavailable = true;
      } else {
        copy.durationSeconds = Math.max(
          1,
          Math.ceil(copy.durationSeconds)
        );
      }

      return copy;
    }));
  }

  function normaliseMusic(entries) {
    return [...entries].sort((a, b) => {
      if (a.id === "none") {
        return -1;
      }

      if (b.id === "none") {
        return 1;
      }

      const aDuration = getMusicSortDuration(a);
      const bDuration = getMusicSortDuration(b);

      return (
        aDuration - bDuration ||
        String(a.label).localeCompare(String(b.label))
      );
    });
  }

  function normaliseAnimations(entries) {
    const valid = Array.isArray(entries)
      ? entries.filter((entry) => entry && entry.id)
      : [];

    return [...valid].sort((a, b) => {
      if (a.id === "none") {
        return -1;
      }

      if (b.id === "none") {
        return 1;
      }

      const aFixed = Number(a.durationSeconds) || Infinity;
      const bFixed = Number(b.durationSeconds) || Infinity;

      return (
        aFixed - bFixed ||
        String(a.label).localeCompare(String(b.label))
      );
    });
  }

  function renderMusic(entries) {
    const fragment = document.createDocumentFragment();
    const hasNone = entries.some((entry) => entry.id === "none");

    entries.forEach((entry, index) => {
      let meta = "";

      if (entry.unavailable) {
        meta = "Unavailable";
      } else if (entry.type === "hurry-up") {
        meta = `Minimum ${formatDuration(entry.minimumDurationSeconds)}`;
      } else if (isPositiveNumber(entry.durationSeconds)) {
        meta = formatDuration(entry.durationSeconds);
      }

      fragment.append(
        createChoice({
          groupName: "music",
          entry,
          checked: (
            entry.id === "none" ||
            (index === 0 && !hasNone)
          ),
          meta,
          disabled: Boolean(entry.unavailable)
        })
      );
    });

    musicOptions.replaceChildren(fragment);
  }

  function renderAnimations(entries) {
    const fragment = document.createDocumentFragment();
    const hasNone = entries.some((entry) => entry.id === "none");

    entries.forEach((entry, index) => {
      fragment.append(
        createChoice({
          groupName: "animation",
          entry,
          checked: (
            entry.id === "none" ||
            (index === 0 && !hasNone)
          ),
          meta: ""
        })
      );
    });

    animationOptions.replaceChildren(fragment);
  }

  function createChoice({
    groupName,
    entry,
    checked,
    meta,
    description = "",
    disabled = false
  }) {
    const label = document.createElement("label");
    label.className = "timer-choice-card";
    label.classList.toggle("is-unavailable", disabled);

    const input = document.createElement("input");
    input.type = "radio";
    input.name = groupName;
    input.value = entry.id;
    input.checked = checked;
    input.disabled = disabled;

    const marker = document.createElement("span");
    marker.className = "timer-choice-marker";
    marker.setAttribute("aria-hidden", "true");

    const copy = document.createElement("span");
    copy.className = "timer-choice-copy";

    const titleRow = document.createElement("span");
    titleRow.className = "timer-choice-title-row";

    const title = document.createElement("strong");
    title.textContent = entry.label;

    titleRow.append(title);

    if (meta) {
      const duration = document.createElement("span");
      duration.className = "timer-choice-duration";
      duration.textContent = meta;
      titleRow.append(duration);
    }

    copy.append(titleRow);

    if (description) {
      const descriptionElement = document.createElement("small");
      descriptionElement.textContent = description;
      copy.append(descriptionElement);
    }

    label.append(input, marker, copy);
    return label;
  }

  function bindEvents() {
    [hoursInput, minutesInput, secondsInput].forEach((input) => {
      input.addEventListener("input", () => {
        normaliseDurationInputs();

        if (!isDurationLocked()) {
          manualDurationSeconds = readDurationSeconds();
        }
      });

      input.addEventListener("blur", () => {
        normaliseDurationInputs();
        enforceMinimumDuration();
      });
    });

    document.querySelectorAll("[data-duration]").forEach((button) => {
      button.addEventListener("click", () => {
        if (isDurationLocked()) {
          return;
        }

        const minimum = getSelectedMinimumDuration();
        const duration = Math.max(
          Number(button.dataset.duration),
          minimum || 0
        );

        setDurationInputs(duration);
        manualDurationSeconds = duration;
        updateDurationRules();
      });
    });

    musicOptions.addEventListener("change", () => {
      reconcileDurations("music");
      updateDurationRules();
    });

    animationOptions.addEventListener("change", () => {
      reconcileDurations("animation");
      updateDurationRules();
    });

    form.addEventListener("submit", launchTimer);
  }

  function reconcileDurations(changedGroup) {
    const music = getSelectedMusic();
    const animation = getSelectedAnimation();
    const musicFixed = getFixedDuration(music);
    const musicMinimum = getMinimumDuration(music);
    const animationFixed = getFixedDuration(animation);

    if (
      musicFixed &&
      animationFixed &&
      musicFixed !== animationFixed
    ) {
      const groupToClear = changedGroup === "music"
        ? "animation"
        : "music";

      selectRadio(groupToClear, "none");
      setStatus(
        groupToClear === "animation"
          ? "The fixed-duration animation was cleared because it did not match the selected music."
          : "The fixed-duration music was cleared because it did not match the selected animation."
      );
      return;
    }

    if (
      musicMinimum &&
      animationFixed &&
      animationFixed < musicMinimum
    ) {
      const groupToClear = changedGroup === "music"
        ? "animation"
        : "music";

      selectRadio(groupToClear, "none");
      setStatus(
        groupToClear === "animation"
          ? "The animation was cleared because it is shorter than the selected Hurry Up! sequence."
          : "The Hurry Up! music was cleared because the selected animation is too short."
      );
      return;
    }

    setStatus("");
  }

  function updateDurationRules() {
    const music = getSelectedMusic();
    const animation = getSelectedAnimation();

    const fixedSource = getFixedDuration(music)
      ? { entry: music, duration: getFixedDuration(music) }
      : getFixedDuration(animation)
        ? {
            entry: animation,
            duration: getFixedDuration(animation)
          }
        : null;

    const wasLocked = isDurationLocked();

    if (fixedSource) {
      if (!wasLocked) {
        manualDurationSeconds = Math.max(
          1,
          readDurationSeconds()
        );
      }

      setDurationInputs(fixedSource.duration);
      setDurationDisabled(true);

      durationLock.hidden = false;
      durationLockText.textContent = (
        `Locked to ${formatDuration(fixedSource.duration)}`
      );
      return;
    }

    setDurationDisabled(false);

    if (wasLocked) {
      setDurationInputs(Math.max(1, manualDurationSeconds));
    }

    const minimum = getMinimumDuration(music);

    if (minimum) {
      if (readDurationSeconds() < minimum) {
        setDurationInputs(minimum);
        manualDurationSeconds = minimum;
      }

      durationLock.hidden = false;
      durationLockText.textContent = (
        `Minimum ${formatDuration(minimum)}`
      );
      return;
    }

    durationLock.hidden = true;
    durationLockText.textContent = "";
  }

  function enforceMinimumDuration() {
    if (isDurationLocked()) {
      return;
    }

    const minimum = getSelectedMinimumDuration();

    if (minimum && readDurationSeconds() < minimum) {
      setDurationInputs(minimum);
      manualDurationSeconds = minimum;
      setStatus(`Minimum ${formatDuration(minimum)}`);
    }
  }

  function setDurationDisabled(disabled) {
    durationFieldset.classList.toggle(
      "is-duration-locked",
      disabled
    );

    [hoursInput, minutesInput, secondsInput].forEach((input) => {
      input.disabled = disabled;
    });

    document.querySelectorAll("[data-duration]").forEach((button) => {
      button.disabled = disabled;
    });
  }

  function isDurationLocked() {
    return durationFieldset.classList.contains(
      "is-duration-locked"
    );
  }

  function getSelectedMusic() {
    const id = form.elements.music?.value || "none";
    return (
      musicById.get(id) ||
      musicById.get("none") ||
      null
    );
  }

  function getSelectedAnimation() {
    const id = form.elements.animation?.value || "none";
    return (
      animationById.get(id) ||
      animationById.get("none") ||
      null
    );
  }

  function getFixedDuration(entry) {
    if (entry?.durationMode === "minimum") {
      return null;
    }

    const value = Number(entry?.durationSeconds);
    return isPositiveNumber(value)
      ? Math.round(value)
      : null;
  }

  function getMinimumDuration(entry) {
    const value = Number(entry?.minimumDurationSeconds);
    return isPositiveNumber(value)
      ? Math.ceil(value)
      : null;
  }

  function getSelectedMinimumDuration() {
    return getMinimumDuration(getSelectedMusic());
  }

  function getMusicSortDuration(entry) {
    if (entry.id === "none") {
      return -1;
    }

    return (
      getMinimumDuration(entry) ||
      getFixedDuration(entry) ||
      Infinity
    );
  }

  function selectRadio(groupName, value) {
    const radio = form.querySelector(
      `input[name="${groupName}"][value="${CSS.escape(value)}"]`
    );

    if (radio) {
      radio.checked = true;
    }
  }

  function normaliseDurationInputs() {
    hoursInput.value = clampInteger(hoursInput.value, 0, 23);
    minutesInput.value = clampInteger(minutesInput.value, 0, 59);
    secondsInput.value = clampInteger(secondsInput.value, 0, 59);
  }

  function readDurationSeconds() {
    return (
      Number(hoursInput.value || 0) * 3600 +
      Number(minutesInput.value || 0) * 60 +
      Number(secondsInput.value || 0)
    );
  }

  function setDurationInputs(totalSeconds) {
    const safeTotal = Math.max(
      0,
      Math.round(Number(totalSeconds) || 0)
    );
    const hours = Math.floor(safeTotal / 3600);
    const minutes = Math.floor((safeTotal % 3600) / 60);
    const seconds = safeTotal % 60;

    hoursInput.value = String(hours);
    minutesInput.value = String(minutes);
    secondsInput.value = String(seconds);
  }

  function clampInteger(value, minimum, maximum) {
    const numeric = Math.floor(Number(value) || 0);
    return String(
      Math.min(maximum, Math.max(minimum, numeric))
    );
  }

  function launchTimer(event) {
    event.preventDefault();
    normaliseDurationInputs();
    enforceMinimumDuration();

    const duration = readDurationSeconds();

    if (duration < 1) {
      setStatus("Set a timer of at least one second.", true);
      hoursInput.focus();
      return;
    }

    const music = getSelectedMusic();
    const animation = getSelectedAnimation();

    if (music?.unavailable) {
      setStatus("The selected music could not be loaded.", true);
      return;
    }

    const minimum = getMinimumDuration(music);

    if (minimum && duration < minimum) {
      setStatus(
        `Minimum ${formatDuration(minimum)}`,
        true
      );
      return;
    }

    const query = new URLSearchParams({
      duration: String(duration),
      music: music?.id || "none",
      animation: animation?.id || "none"
    });

    const timerWindow = window.open(
      `timer.html?${query.toString()}`,
      "classroomTimer",
      "popup=yes,width=1280,height=820,resizable=yes,scrollbars=no"
    );

    if (!timerWindow) {
      setStatus(
        "The timer window was blocked. Allow pop-ups for this page and try again.",
        true
      );
      return;
    }

    timerWindow.focus();
    setStatus("");
  }

  function readAudioDuration(src) {
    if (!src) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      const audio = new Audio();
      let finished = false;

      const finish = (value) => {
        if (finished) {
          return;
        }

        finished = true;
        window.clearTimeout(timeoutId);
        audio.removeAttribute("src");
        audio.load();
        resolve(value);
      };

      const timeoutId = window.setTimeout(
        () => finish(null),
        10000
      );

      audio.preload = "metadata";
      audio.addEventListener("loadedmetadata", () => {
        const duration = Number(audio.duration);
        finish(isPositiveNumber(duration) ? duration : null);
      }, { once: true });
      audio.addEventListener(
        "error",
        () => finish(null),
        { once: true }
      );
      audio.src = src;
      audio.load();
    });
  }

  function isPositiveNumber(value) {
    return Number.isFinite(Number(value)) && Number(value) > 0;
  }

  function formatDuration(totalSeconds) {
    const safeSeconds = Math.max(
      0,
      Math.round(Number(totalSeconds) || 0)
    );
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    if (hours > 0) {
      return [hours, minutes, seconds]
        .map((part, index) => (
          index === 0
            ? String(part)
            : String(part).padStart(2, "0")
        ))
        .join(":");
    }

    return (
      `${String(minutes).padStart(2, "0")}:` +
      String(seconds).padStart(2, "0")
    );
  }

  function setStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  }
})();
