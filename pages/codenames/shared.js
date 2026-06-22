globalThis.CodenamesGame = (() => {
  "use strict";

  const STATE_KEY = "codenamesGameStateV1";
  const SETTINGS_KEY = "codenamesSettingsV1";
  const CHANNEL_NAME = "codenamesGameChannelV1";
  const STATE_VERSION = 1;
  const BOARD_SIZE = 25;
  const SOLO_GREEN_COUNT = 9;
  const SOLO_MAX_TURNS = 5;

  const channel = "BroadcastChannel" in window
    ? new BroadcastChannel(CHANNEL_NAME)
    : null;

  function createGameState(items, mode = "teams") {
    if (!Array.isArray(items) || items.length !== BOARD_SIZE) {
      throw new Error(`Codenames requires exactly ${BOARD_SIZE} board items.`);
    }

    const normalisedMode = mode === "solo" ? "solo" : "teams";
    const startingTeam = normalisedMode === "teams"
      ? (Math.random() < 0.5 ? "blue" : "red")
      : "green";

    const roles = createRoles(normalisedMode, startingTeam);

    return {
      version: STATE_VERSION,
      gameId: `codenames-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      status: "preview",
      mode: normalisedMode,
      board: items.map((entry, index) => ({
        itemId: entry.id,
        role: roles[index],
        revealed: false
      })),
      startingTeam,
      currentTeam: startingTeam,
      turnNumber: 1,
      maxTurns: normalisedMode === "solo" ? SOLO_MAX_TURNS : null,
      clueText: "",
      clueNumber: null,
      guessesRemaining: 0,
      winner: null,
      endReason: "",
      message: normalisedMode === "solo"
        ? "Prepare the board, then start the five-turn mission."
        : `${capitalise(startingTeam)} team will start.`,
      lastAction: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  function createRoles(mode, startingTeam) {
    const roles = [];

    if (mode === "solo") {
      roles.push(...Array(SOLO_GREEN_COUNT).fill("green"));
      roles.push("assassin");
      roles.push(...Array(BOARD_SIZE - SOLO_GREEN_COUNT - 1).fill("neutral"));
      return shuffle(roles);
    }

    const otherTeam = oppositeTeam(startingTeam);
    roles.push(...Array(9).fill(startingTeam));
    roles.push(...Array(8).fill(otherTeam));
    roles.push(...Array(7).fill("neutral"));
    roles.push("assassin");
    return shuffle(roles);
  }

  function startGame(state) {
    const next = cloneState(state);
    next.status = "playing";
    next.clueText = "";
    next.clueNumber = null;
    next.guessesRemaining = 0;
    next.winner = null;
    next.endReason = "";
    next.lastAction = null;
    next.message = waitingForClueMessage(next);
    next.updatedAt = Date.now();
    return next;
  }

  function giveClue(state, text, number) {
    if (!state || state.status !== "playing") {
      throw new Error("Start the game before giving a clue.");
    }

    if (state.clueText) {
      throw new Error("End the current turn before giving another clue.");
    }

    const clueText = String(text || "").trim();
    const clueNumber = Math.max(1, Math.min(9, Math.round(Number(number) || 0)));

    if (!clueText) throw new Error("Enter a clue term.");

    const next = cloneState(state);
    next.clueText = clueText;
    next.clueNumber = clueNumber;
    next.guessesRemaining = clueNumber + 1;
    next.lastAction = null;
    next.message = `${capitalise(next.currentTeam)} team may make up to ${next.guessesRemaining} guesses.`;
    next.updatedAt = Date.now();
    return next;
  }

  function revealCard(state, boardIndex) {
    if (!state || state.status !== "playing") return state;
    if (!state.clueText || state.guessesRemaining <= 0) return state;

    const index = Number(boardIndex);
    const target = state.board[index];
    if (!target || target.revealed) return state;

    const next = cloneState(state);
    next.lastAction = makeUndoSnapshot(state);
    const card = next.board[index];
    card.revealed = true;

    if (card.role === "assassin") {
      next.status = "lost";
      next.endReason = "assassin";
      next.winner = next.mode === "teams"
        ? oppositeTeam(next.currentTeam)
        : null;
      next.guessesRemaining = 0;
      next.message = next.mode === "teams"
        ? `${capitalise(next.currentTeam)} team found the assassin. ${capitalise(next.winner)} team wins.`
        : "The black card was uncovered. Mission failed.";
      next.updatedAt = Date.now();
      return next;
    }

    if (next.mode === "solo") {
      if (card.role === "green") {
        next.guessesRemaining = Math.max(0, next.guessesRemaining - 1);

        if (countRemaining(next, "green") === 0) {
          next.status = "won";
          next.winner = "green";
          next.endReason = "all-green";
          next.message = `All green cards were found in ${next.turnNumber} turn${next.turnNumber === 1 ? "" : "s"}.`;
        } else if (next.guessesRemaining === 0) {
          finishTurnInPlace(next, "guess-limit", true);
        } else {
          next.message = `Correct. ${next.guessesRemaining} guesses remain this turn.`;
        }
      } else {
        finishTurnInPlace(next, "neutral", true);
      }

      next.updatedAt = Date.now();
      return next;
    }

    if (card.role === next.currentTeam) {
      next.guessesRemaining = Math.max(0, next.guessesRemaining - 1);

      if (countRemaining(next, next.currentTeam) === 0) {
        next.status = "won";
        next.winner = next.currentTeam;
        next.endReason = "all-agents";
        next.message = `${capitalise(next.currentTeam)} team found all of their agents.`;
      } else if (next.guessesRemaining === 0) {
        finishTurnInPlace(next, "guess-limit", true);
      } else {
        next.message = `Correct. ${next.guessesRemaining} guesses remain.`;
      }
    } else if (card.role === "neutral") {
      finishTurnInPlace(next, "neutral", true);
    } else {
      const opponent = card.role;

      if (countRemaining(next, opponent) === 0) {
        next.status = "won";
        next.winner = opponent;
        next.endReason = "opponent-completed";
        next.message = `${capitalise(opponent)} team now has all of its agents revealed and wins.`;
      } else {
        finishTurnInPlace(next, "opponent", true);
      }
    }

    next.updatedAt = Date.now();
    return next;
  }

  function endTurn(state, reason = "manual") {
    if (!state || state.status !== "playing") return state;
    const next = cloneState(state);
    next.lastAction = makeUndoSnapshot(state);
    finishTurnInPlace(next, reason, true);
    next.updatedAt = Date.now();
    return next;
  }

  function finishTurnInPlace(state, reason, preserveUndo) {
    if (!preserveUndo) state.lastAction = makeUndoSnapshot(state);

    const endingTeam = state.currentTeam;
    const endingTurn = state.turnNumber;

    state.clueText = "";
    state.clueNumber = null;
    state.guessesRemaining = 0;

    if (state.mode === "solo") {
      if (state.turnNumber >= state.maxTurns) {
        state.status = "lost";
        state.endReason = "turn-limit";
        state.winner = null;
        state.message = "Five turns have been used before every green card was found.";
        return;
      }

      state.turnNumber += 1;

      if (reason === "neutral") {
        state.message = `A beige card ended turn ${endingTurn}. Turn ${state.turnNumber} is waiting for a clue.`;
      } else if (reason === "guess-limit") {
        state.message = `The guess limit ended turn ${endingTurn}. Turn ${state.turnNumber} is waiting for a clue.`;
      } else {
        state.message = `Turn ${endingTurn} ended. Turn ${state.turnNumber} is waiting for a clue.`;
      }
      return;
    }

    state.currentTeam = oppositeTeam(state.currentTeam);
    state.turnNumber += 1;

    if (reason === "neutral") {
      state.message = `${capitalise(endingTeam)} team selected a bystander. ${capitalise(state.currentTeam)} team is waiting for a clue.`;
    } else if (reason === "opponent") {
      state.message = `${capitalise(endingTeam)} team revealed an opposing agent. ${capitalise(state.currentTeam)} team is waiting for a clue.`;
    } else if (reason === "guess-limit") {
      state.message = `${capitalise(endingTeam)} team used all of its guesses. ${capitalise(state.currentTeam)} team is waiting for a clue.`;
    } else {
      state.message = `${capitalise(endingTeam)} team ended its turn. ${capitalise(state.currentTeam)} team is waiting for a clue.`;
    }
  }

  function undoLastAction(state) {
    if (!state?.lastAction) return state;
    const restored = cloneState(state.lastAction);
    restored.lastAction = null;
    restored.updatedAt = Date.now();
    return restored;
  }

  function countRemaining(state, role) {
    return state.board.filter(
      (card) => card.role === role && !card.revealed
    ).length;
  }

  function getCounts(state) {
    return {
      blue: countRemaining(state, "blue"),
      red: countRemaining(state, "red"),
      green: countRemaining(state, "green"),
      neutral: countRemaining(state, "neutral"),
      assassin: countRemaining(state, "assassin")
    };
  }

  function canGuess(state) {
    return Boolean(
      state &&
      state.status === "playing" &&
      state.clueText &&
      state.guessesRemaining > 0
    );
  }

  function waitingForClueMessage(state) {
    if (state.mode === "solo") {
      return `Turn ${state.turnNumber} of ${state.maxTurns}: waiting for a clue.`;
    }
    return `${capitalise(state.currentTeam)} team: waiting for a clue.`;
  }

  function makeUndoSnapshot(state) {
    const snapshot = cloneState(state);
    snapshot.lastAction = null;
    return snapshot;
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STATE_KEY) || "null");
      return parsed?.version === STATE_VERSION ? parsed : null;
    } catch {
      return null;
    }
  }

  function saveState(state, eventType = "state-updated") {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    channel?.postMessage({ type: eventType, state });
  }

  function clearState() {
    localStorage.removeItem(STATE_KEY);
    channel?.postMessage({ type: "state-cleared", state: null });
  }

  function subscribe(callback) {
    const onStorage = (event) => {
      if (event.key === STATE_KEY) callback(loadState());
    };

    const onMessage = (event) => {
      if (event.data?.type === "state-updated" ||
          event.data?.type === "state-cleared" ||
          event.data?.type === "game-started") {
        callback(event.data.state || null);
      }
    };

    window.addEventListener("storage", onStorage);
    channel?.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("storage", onStorage);
      channel?.removeEventListener("message", onMessage);
    };
  }

  function loadSettings(defaults) {
    try {
      const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
      return parsed ? { ...defaults, ...parsed } : { ...defaults };
    } catch {
      return { ...defaults };
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function oppositeTeam(team) {
    return team === "blue" ? "red" : "blue";
  }

  function capitalise(value) {
    const text = String(value || "");
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function cloneState(value) {
    if (typeof structuredClone === "function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function shuffle(values) {
    const result = [...values];
    for (let index = result.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
    }
    return result;
  }

  return Object.freeze({
    STATE_KEY,
    SETTINGS_KEY,
    BOARD_SIZE,
    SOLO_GREEN_COUNT,
    SOLO_MAX_TURNS,
    createGameState,
    startGame,
    giveClue,
    revealCard,
    endTurn,
    undoLastAction,
    getCounts,
    canGuess,
    loadState,
    saveState,
    clearState,
    subscribe,
    loadSettings,
    saveSettings,
    oppositeTeam,
    capitalise
  });
})();
