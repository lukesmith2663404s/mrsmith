importScripts("../../js/countdown-number-solver.js");

self.addEventListener("message", (event) => {
  try {
    const result = CountdownNumberSolver.createGuaranteedRound(
      event.data.numbers
    );

    self.postMessage({
      ok: true,
      result
    });
  } catch (error) {
    self.postMessage({
      ok: false,
      error: error instanceof Error
        ? error.message
        : "The numbers round could not be generated."
    });
  }
});
