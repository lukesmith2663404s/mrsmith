(() => {
  "use strict";

  const options = globalThis.TIMER_OPTIONS || {
    music: [],
    animations: []
  };

  const display = document.getElementById("timerDisplay");
  const timeElement = document.getElementById("timerTime");
  const stateLabel = document.getElementById("timerStateLabel");
  const screenDrain = document.getElementById("screenDrain");
  const radialClock = document.getElementById("radialClock");
  const circleAnimation = document.getElementById("circleAnimation");
  const circleContext = circleAnimation.getContext("2d");
  const gifAnimation = document.getElementById("gifAnimation");
  const mediaSummary = document.getElementById("timerMediaSummary");
  const startTimerButton = document.getElementById("startTimerButton");
  const fullscreenButton = document.getElementById("fullscreenButton");
  const pauseButton = document.getElementById("pauseButton");
  const restartButton = document.getElementById("restartButton");
  const closeButton = document.getElementById("closeButton");

  const query = new URLSearchParams(window.location.search);
  const durationSeconds = clampDuration(query.get("duration"));
  const music = findOption(
    options.music,
    query.get("music"),
    "none"
  );
  const animation = findOption(
    options.animations,
    query.get("animation"),
    "none"
  );

  const timer = {
    durationMs: durationSeconds * 1000,
    remainingMs: durationSeconds * 1000,
    startedAt: 0,
    running: false,
    started: false,
    finished: false,
    frameId: 0
  };

  let audioController = null;
  let audioBlocked = false;
  let audioUnavailable = false;

  const circleState = {
    enabled: false,
    total: 0,
    visibleCount: 0,
    removalCursor: 0,
    circles: [],
    removalOrder: [],
    fades: [],
    fadeFrameId: 0,
    resizeFrameId: 0,
    devicePixelRatio: 1,
    width: 0,
    height: 0
  };

  initialise().catch((error) => {
    console.error(error);
    audioUnavailable = true;
    mediaSummary.textContent = `${music?.label || "Music"} could not be loaded.`;
    mediaSummary.classList.add("is-error");
    bindEvents();
    prepareReadyState();
    render();
  });

  async function initialise() {
    configureAnimation();
    await configureMusic();
    renderMediaSummary();
    bindEvents();
    prepareReadyState();
    render();
  }

  function configureAnimation() {
    const animationType = String(animation?.type || "none");
    display.dataset.animation = animationType;

    if (animationType === "disappearing-circles") {
      circleState.enabled = true;
      circleAnimation.hidden = false;
      resetCircleAnimation();
    }

    if (animationType === "gif" && animation?.src) {
      gifAnimation.hidden = false;
      gifAnimation.style.objectFit = animation.fit === "cover"
        ? "cover"
        : "contain";
      restartGif();
    }
  }

  async function configureMusic() {
    if (!music || music.id === "none" || music.type === "none") {
      return;
    }

    if (music.type === "hurry-up") {
      const base = createAudio(music.baseSrc, true);
      const transition = createAudio(music.transitionSrc, false);
      const hurry = createAudio(music.hurrySrc, false);

      const [baseDuration, transitionDuration, hurryDuration] = await Promise.all([
        waitForAudioMetadata(base),
        waitForAudioMetadata(transition),
        waitForAudioMetadata(hurry)
      ]);

      const minimumDuration = transitionDuration + hurryDuration;

      if (timer.durationMs / 1000 < minimumDuration) {
        throw new Error(
          "The selected timer is shorter than the Hurry Up! ending."
        );
      }

      audioController = {
        type: "hurry-up",
        audios: [base, transition, hurry],
        base,
        transition,
        hurry,
        baseDuration,
        transitionDuration,
        hurryDuration,
        transitionStart: (
          timer.durationMs / 1000 - minimumDuration
        ),
        hurryStart: (
          timer.durationMs / 1000 - hurryDuration
        ),
        activePhase: null
      };
      return;
    }

    const audio = createAudio(music.src, false);
    await waitForAudioMetadata(audio);

    audioController = {
      type: "standard",
      audios: [audio],
      audio
    };
  }

  function createAudio(src, loop) {
    if (!src) {
      throw new Error("A music file path is missing.");
    }

    const audio = new Audio(src);
    audio.preload = "auto";
    audio.loop = loop;
    audio.volume = 1;

    audio.addEventListener("error", () => {
      audioUnavailable = true;
      mediaSummary.textContent = `${music.label} could not be loaded.`;
      mediaSummary.classList.add("is-error");
    });

    return audio;
  }

  function waitForAudioMetadata(audio) {
    return new Promise((resolve, reject) => {
      const existing = Number(audio.duration);

      if (Number.isFinite(existing) && existing > 0) {
        resolve(existing);
        return;
      }

      let finished = false;

      const cleanup = () => {
        window.clearTimeout(timeoutId);
        audio.removeEventListener("loadedmetadata", loaded);
        audio.removeEventListener("error", failed);
      };

      const loaded = () => {
        if (finished) {
          return;
        }

        finished = true;
        cleanup();

        const duration = Number(audio.duration);

        if (Number.isFinite(duration) && duration > 0) {
          resolve(duration);
        } else {
          reject(new Error("The audio duration could not be read."));
        }
      };

      const failed = () => {
        if (finished) {
          return;
        }

        finished = true;
        cleanup();
        reject(new Error("The audio file could not be loaded."));
      };

      const timeoutId = window.setTimeout(failed, 12000);

      audio.addEventListener("loadedmetadata", loaded, { once: true });
      audio.addEventListener("error", failed, { once: true });
      audio.load();
    });
  }

  function bindEvents() {
    startTimerButton.addEventListener("click", startTimer);
    fullscreenButton.addEventListener("click", toggleFullscreen);
    pauseButton.addEventListener("click", togglePause);
    restartButton.addEventListener("click", restartTimer);
    closeButton.addEventListener("click", () => window.close());

    document.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        event.preventDefault();

        if (!timer.started) {
          startTimer();
        } else {
          togglePause();
        }
      }

      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        toggleFullscreen();
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        restartTimer();
      }
    });

    document.addEventListener(
      "fullscreenchange",
      updateFullscreenButton
    );
    window.addEventListener("resize", scheduleCircleResize);
    window.addEventListener("beforeunload", () => {
      stopAudio();
      stopCircleAnimationFrames();
    });
  }

  async function startTimer() {
    if (timer.running || timer.started || timer.finished) {
      return;
    }

    timer.started = true;
    timer.running = true;

    startTimerButton.disabled = true;
    stateLabel.textContent = "Starting…";
    pauseButton.textContent = "Pause";
    pauseButton.disabled = false;

    display.classList.add("is-running");
    display.classList.remove(
      "is-ready",
      "is-paused",
      "is-finished"
    );

    await startAudio();

    startTimerButton.hidden = true;
    stateLabel.textContent = "Time remaining";
    timer.startedAt = performance.now();
    tick(timer.startedAt);
  }

  function prepareReadyState() {
    timer.started = false;
    timer.running = false;

    startTimerButton.hidden = false;
    startTimerButton.disabled = false;
    pauseButton.textContent = "Pause";
    pauseButton.disabled = true;
    stateLabel.textContent = "Ready";

    display.classList.add("is-ready");
    display.classList.remove(
      "is-running",
      "is-paused",
      "is-finished"
    );
  }

  function tick(now) {
    if (!timer.running) {
      return;
    }

    const elapsed = now - timer.startedAt;
    timer.remainingMs = Math.max(
      0,
      timer.remainingMs - elapsed
    );
    timer.startedAt = now;

    render();
    syncHurryUpPhase(false).catch(() => {
      // A playback problem is shown in the music summary.
    });

    if (timer.remainingMs <= 0) {
      finishTimer();
      return;
    }

    timer.frameId = window.requestAnimationFrame(tick);
  }

  function togglePause() {
    if (!timer.started || timer.finished) {
      return;
    }

    if (timer.running) {
      pauseTimer();
    } else {
      resumeTimer();
    }
  }

  function pauseTimer() {
    timer.running = false;
    window.cancelAnimationFrame(timer.frameId);
    pauseAudio();

    display.classList.remove("is-running");
    display.classList.add("is-paused");
    stateLabel.textContent = "Paused";
    pauseButton.textContent = "Resume";
  }

  function resumeTimer() {
    timer.running = true;
    timer.startedAt = performance.now();

    display.classList.add("is-running");
    display.classList.remove("is-paused");
    stateLabel.textContent = "Time remaining";
    pauseButton.textContent = "Pause";

    resumeAudio();
    tick(timer.startedAt);
  }

  async function restartTimer() {
    window.cancelAnimationFrame(timer.frameId);

    timer.remainingMs = timer.durationMs;
    timer.running = false;
    timer.started = false;
    timer.finished = false;

    stopAudio();
    restartGif();
    resetCircleAnimation();
    prepareReadyState();
    render();

    await startTimer();
  }

  function finishTimer() {
    timer.running = false;
    timer.started = true;
    timer.finished = true;
    timer.remainingMs = 0;

    window.cancelAnimationFrame(timer.frameId);
    stopAudio(false);

    display.classList.remove("is-running", "is-paused");
    display.classList.add("is-finished");
    stateLabel.textContent = "Time's up!";
    pauseButton.textContent = "Pause";
    pauseButton.disabled = true;

    render();
  }

  function render() {
    const ratio = timer.durationMs > 0
      ? Math.max(
          0,
          Math.min(1, timer.remainingMs / timer.durationMs)
        )
      : 0;

    const seconds = Math.ceil(timer.remainingMs / 1000);
    const progressDegrees = ratio * 360;
    const elapsedDegrees = (1 - ratio) * 360;
    const hue = calculateProgressHue(ratio);

    timeElement.textContent = formatTime(seconds);
    display.style.setProperty(
      "--remaining-ratio",
      String(ratio)
    );
    display.style.setProperty(
      "--progress-degrees",
      `${progressDegrees}deg`
    );
    display.style.setProperty(
      "--elapsed-degrees",
      `${elapsedDegrees}deg`
    );
    display.style.setProperty(
      "--progress-hue",
      String(hue)
    );
    display.style.setProperty(
      "--drain-scale",
      String(ratio)
    );

    screenDrain.style.setProperty(
      "--drain-scale",
      String(ratio)
    );
    radialClock.style.setProperty(
      "--elapsed-degrees",
      `${elapsedDegrees}deg`
    );

    syncCircleAnimation(seconds);
  }

  function resetCircleAnimation() {
    if (!circleState.enabled || !circleContext) {
      return;
    }

    stopCircleAnimationFrames();

    circleState.total = durationSeconds;
    circleState.visibleCount = durationSeconds;
    circleState.removalCursor = 0;
    circleState.fades = [];

    buildCircleLayout(0);
  }

  function scheduleCircleResize() {
    if (!circleState.enabled) {
      return;
    }

    window.cancelAnimationFrame(circleState.resizeFrameId);

    circleState.resizeFrameId = window.requestAnimationFrame(() => {
      circleState.resizeFrameId = 0;
      const removedCount = circleState.removalCursor;
      stopCircleFadeFrame();
      circleState.fades = [];
      buildCircleLayout(removedCount);
    });
  }

  function buildCircleLayout(removedCount) {
    const bounds = display.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width));
    const height = Math.max(1, Math.round(bounds.height));
    const pixelRatio = Math.min(
      2,
      Math.max(1, window.devicePixelRatio || 1)
    );

    circleState.width = width;
    circleState.height = height;
    circleState.devicePixelRatio = pixelRatio;

    circleAnimation.width = Math.round(width * pixelRatio);
    circleAnimation.height = Math.round(height * pixelRatio);
    circleAnimation.style.width = `${width}px`;
    circleAnimation.style.height = `${height}px`;

    circleContext.setTransform(
      pixelRatio,
      0,
      0,
      pixelRatio,
      0,
      0
    );
    circleContext.clearRect(0, 0, width, height);

    circleState.circles = createCircleLayout(
      circleState.total,
      width,
      height
    );
    circleState.removalOrder = shuffledIndexes(
      circleState.total
    );
    circleState.removalCursor = Math.min(
      circleState.total,
      Math.max(0, removedCount)
    );
    circleState.visibleCount = (
      circleState.total - circleState.removalCursor
    );

    for (
      let index = 0;
      index < circleState.removalCursor;
      index += 1
    ) {
      const removedIndex = circleState.removalOrder[index];
      circleState.circles[removedIndex].active = false;
    }

    circleState.circles.forEach((circle) => {
      if (circle.active) {
        drawCircle(circle);
      }
    });
  }

  function createCircleLayout(total, width, height) {
    if (total < 1) {
      return [];
    }

    const left = width * 0.035;
    const right = width * 0.965;
    const top = height * 0.105;
    const bottom = height * 0.895;
    const usableWidth = Math.max(1, right - left);
    const usableHeight = Math.max(1, bottom - top);
    const targetCells = Math.max(
      total,
      Math.ceil(total * 1.58)
    );
    const aspect = usableWidth / usableHeight;
    let columns = Math.max(
      1,
      Math.ceil(Math.sqrt(targetCells * aspect))
    );
    let rows = Math.max(
      1,
      Math.ceil(targetCells / columns)
    );

    while (columns * rows < targetCells) {
      rows += 1;
    }

    const cells = [];

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const normalX = (column + 0.5) / columns;
        const normalY = (row + 0.5) / rows;
        const insideCentre = (
          normalX > 0.285 &&
          normalX < 0.715 &&
          normalY > 0.34 &&
          normalY < 0.66
        );

        if (!insideCentre) {
          cells.push({ row, column });
        }
      }
    }

    if (cells.length < total) {
      cells.length = 0;

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          cells.push({ row, column });
        }
      }
    }

    shuffle(cells);

    const cellWidth = usableWidth / columns;
    const cellHeight = usableHeight / rows;
    const maximumRadius = Math.min(
      24,
      Math.max(
        1.2,
        Math.min(cellWidth, cellHeight) * 0.115
      )
    );
    return cells.slice(0, total).map((cell) => {
      const jitterX = (Math.random() - 0.5) * cellWidth * 0.34;
      const jitterY = (Math.random() - 0.5) * cellHeight * 0.34;
      const radius = maximumRadius * (
        0.68 + Math.random() * 0.32
      );
      const hue = Math.floor(Math.random() * 360);
      const saturation = 78 + Math.floor(Math.random() * 23);
      const lightness = 52 + Math.floor(Math.random() * 19);

      return {
        x: (
          left +
          (cell.column + 0.5) * cellWidth +
          jitterX
        ),
        y: (
          top +
          (cell.row + 0.5) * cellHeight +
          jitterY
        ),
        radius,
        hue,
        saturation,
        lightness,
        active: true
      };
    });
  }

  function shuffledIndexes(length) {
    const indexes = Array.from(
      { length },
      (_, index) => index
    );
    shuffle(indexes);
    return indexes;
  }

  function shuffle(entries) {
    for (
      let index = entries.length - 1;
      index > 0;
      index -= 1
    ) {
      const swapIndex = Math.floor(
        Math.random() * (index + 1)
      );
      [entries[index], entries[swapIndex]] = [
        entries[swapIndex],
        entries[index]
      ];
    }

    return entries;
  }

  function drawCircle(circle) {
    const glowRadius = circle.radius * 2.15;
    const highlightLightness = Math.min(
      94,
      circle.lightness + 30
    );
    const gradient = circleContext.createRadialGradient(
      circle.x - circle.radius * 0.22,
      circle.y - circle.radius * 0.22,
      circle.radius * 0.08,
      circle.x,
      circle.y,
      glowRadius
    );

    gradient.addColorStop(
      0,
      `hsl(${circle.hue} 100% ${highlightLightness}%)`
    );
    gradient.addColorStop(
      0.28,
      `hsl(${circle.hue} ${circle.saturation}% ${circle.lightness}%)`
    );
    gradient.addColorStop(
      0.58,
      `hsla(${circle.hue}, ${circle.saturation}%, ${circle.lightness}%, 0.78)`
    );
    gradient.addColorStop(
      1,
      `hsla(${circle.hue}, ${circle.saturation}%, ${circle.lightness}%, 0)`
    );

    circleContext.save();
    circleContext.globalCompositeOperation = "source-over";
    circleContext.fillStyle = gradient;
    circleContext.beginPath();
    circleContext.arc(
      circle.x,
      circle.y,
      glowRadius,
      0,
      Math.PI * 2
    );
    circleContext.fill();
    circleContext.restore();
  }

  function syncCircleAnimation(secondsRemaining) {
    if (!circleState.enabled || !circleContext) {
      return;
    }

    const targetVisible = Math.min(
      circleState.total,
      Math.max(0, Math.round(secondsRemaining))
    );

    if (targetVisible >= circleState.visibleCount) {
      return;
    }

    const removalsNeeded = (
      circleState.visibleCount - targetVisible
    );

    for (
      let offset = 0;
      offset < removalsNeeded;
      offset += 1
    ) {
      const circleIndex = (
        circleState.removalOrder[
          circleState.removalCursor
        ]
      );

      circleState.removalCursor += 1;
      circleState.visibleCount -= 1;

      const shouldAnimate = (
        offset === removalsNeeded - 1 ||
        removalsNeeded <= 3
      );

      removeCircle(
        circleState.circles[circleIndex],
        shouldAnimate
      );
    }
  }

  function removeCircle(circle, animate) {
    if (!circle || !circle.active) {
      return;
    }

    if (!animate) {
      eraseCircle(circle, 1);
      circle.active = false;
      return;
    }

    circleState.fades.push({
      circle,
      startedAt: performance.now(),
      duration: 720,
      previousProgress: 0
    });

    if (!circleState.fadeFrameId) {
      circleState.fadeFrameId = window.requestAnimationFrame(
        animateCircleFades
      );
    }
  }

  function animateCircleFades(now) {
    circleState.fadeFrameId = 0;

    circleState.fades = circleState.fades.filter((fade) => {
      const progress = Math.min(
        1,
        Math.max(
          0,
          (now - fade.startedAt) / fade.duration
        )
      );
      const remainingOpacity = 1 - fade.previousProgress;
      const eraseAmount = remainingOpacity > 0
        ? (progress - fade.previousProgress) / remainingOpacity
        : 1;

      eraseCircle(
        fade.circle,
        Math.min(1, Math.max(0, eraseAmount))
      );

      fade.previousProgress = progress;

      if (progress >= 1) {
        fade.circle.active = false;
        return false;
      }

      return true;
    });

    if (circleState.fades.length > 0) {
      circleState.fadeFrameId = window.requestAnimationFrame(
        animateCircleFades
      );
    }
  }

  function eraseCircle(circle, opacity) {
    const eraseRadius = circle.radius * 2.28;

    circleContext.save();
    circleContext.globalCompositeOperation = "destination-out";
    circleContext.globalAlpha = opacity;
    circleContext.fillStyle = "#000";
    circleContext.beginPath();
    circleContext.arc(
      circle.x,
      circle.y,
      eraseRadius,
      0,
      Math.PI * 2
    );
    circleContext.fill();
    circleContext.restore();
  }

  function stopCircleFadeFrame() {
    window.cancelAnimationFrame(circleState.fadeFrameId);
    circleState.fadeFrameId = 0;
  }

  function stopCircleAnimationFrames() {
    stopCircleFadeFrame();
    window.cancelAnimationFrame(circleState.resizeFrameId);
    circleState.resizeFrameId = 0;
  }

  function calculateProgressHue(ratio) {
    if (ratio >= 0.5) {
      return 60 + ((ratio - 0.5) / 0.5) * 60;
    }

    return ratio * 120;
  }

  async function startAudio() {
    if (!audioController || audioUnavailable) {
      return;
    }

    audioBlocked = false;

    try {
      await syncAudioToTimer(true);
    } catch {
      audioBlocked = true;
      mediaSummary.textContent = `${music.label} could not start.`;
      mediaSummary.classList.add("is-error");
    }
  }

  function pauseAudio() {
    audioController?.audios.forEach((audio) => audio.pause());
  }

  function resumeAudio() {
    if (!audioController || audioBlocked || audioUnavailable) {
      return;
    }

    syncAudioToTimer(true).catch(() => {
      audioBlocked = true;
      mediaSummary.textContent = `${music.label} could not resume.`;
      mediaSummary.classList.add("is-error");
    });
  }

  function stopAudio(reset = true) {
    if (!audioController) {
      return;
    }

    audioController.audios.forEach((audio) => {
      audio.pause();

      if (reset) {
        safeSeek(audio, 0);
      }
    });

    if (audioController.type === "hurry-up") {
      audioController.activePhase = null;
    }
  }

  async function syncAudioToTimer(force) {
    if (!audioController || audioUnavailable) {
      return;
    }

    if (audioController.type === "hurry-up") {
      await syncHurryUpPhase(force);
      return;
    }

    const elapsedSeconds = getElapsedSeconds();
    const audio = audioController.audio;

    if (force) {
      safeSeek(audio, elapsedSeconds);
    }

    if (timer.running && audio.paused) {
      await audio.play();
    }
  }

  async function syncHurryUpPhase(force) {
    if (
      !audioController ||
      audioController.type !== "hurry-up" ||
      audioBlocked ||
      audioUnavailable
    ) {
      return;
    }

    const elapsedSeconds = getElapsedSeconds();
    const phase = getHurryUpPhase(elapsedSeconds);

    if (!force && phase.name === audioController.activePhase) {
      return;
    }

    audioController.audios.forEach((audio) => audio.pause());
    audioController.activePhase = phase.name;
    safeSeek(phase.audio, phase.offsetSeconds);

    if (timer.running) {
      try {
        await phase.audio.play();
      } catch (error) {
        audioBlocked = true;
        mediaSummary.textContent = `${music.label} could not continue.`;
        mediaSummary.classList.add("is-error");
        throw error;
      }
    }
  }

  function getHurryUpPhase(elapsedSeconds) {
    if (elapsedSeconds < audioController.transitionStart) {
      const offset = audioController.baseDuration > 0
        ? elapsedSeconds % audioController.baseDuration
        : 0;

      return {
        name: "base",
        audio: audioController.base,
        offsetSeconds: offset
      };
    }

    if (elapsedSeconds < audioController.hurryStart) {
      return {
        name: "transition",
        audio: audioController.transition,
        offsetSeconds: (
          elapsedSeconds - audioController.transitionStart
        )
      };
    }

    return {
      name: "hurry",
      audio: audioController.hurry,
      offsetSeconds: elapsedSeconds - audioController.hurryStart
    };
  }

  function getElapsedSeconds() {
    return Math.max(
      0,
      (timer.durationMs - timer.remainingMs) / 1000
    );
  }

  function safeSeek(audio, seconds) {
    try {
      const duration = Number(audio.duration);
      const maximum = Number.isFinite(duration) && duration > 0
        ? Math.max(0, duration - 0.02)
        : Math.max(0, seconds);

      audio.currentTime = Math.min(
        Math.max(0, seconds),
        maximum
      );
    } catch {
      // Seeking can fail briefly while a browser finalises metadata.
    }
  }

  function restartGif() {
    if (animation?.type !== "gif" || !animation?.src) {
      return;
    }

    const separator = animation.src.includes("?") ? "&" : "?";
    gifAnimation.src = (
      `${animation.src}${separator}restart=${Date.now()}`
    );
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      fullscreenButton.textContent = "Fullscreen unavailable";
    }
  }

  function updateFullscreenButton() {
    fullscreenButton.textContent = document.fullscreenElement
      ? "Exit fullscreen"
      : "Fullscreen";
  }

  function renderMediaSummary() {
    const parts = [];

    if (music?.id && music.id !== "none") {
      parts.push(`Music: ${music.label}`);
    }

    if (animation?.id && animation.id !== "none") {
      parts.push(`Animation: ${animation.label}`);
    }

    mediaSummary.textContent = parts.length > 0
      ? parts.join(" · ")
      : "Basic timer";
  }

  function findOption(entries, id, fallbackId) {
    const validEntries = Array.isArray(entries) ? entries : [];
    return (
      validEntries.find((entry) => entry.id === id) ||
      validEntries.find((entry) => entry.id === fallbackId) ||
      null
    );
  }

  function clampDuration(value) {
    const duration = Math.round(Number(value) || 60);
    return Math.min(
      24 * 60 * 60,
      Math.max(1, duration)
    );
  }

  function formatTime(totalSeconds) {
    const safeSeconds = Math.max(
      0,
      Math.round(Number(totalSeconds) || 0)
    );
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    if (hours > 0) {
      return (
        `${hours}:` +
        `${String(minutes).padStart(2, "0")}:` +
        String(seconds).padStart(2, "0")
      );
    }

    return (
      `${String(minutes).padStart(2, "0")}:` +
      String(seconds).padStart(2, "0")
    );
  }
})();
