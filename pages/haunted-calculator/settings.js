const form = document.querySelector("#settingsForm");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const settings = {
    difficulty: document.querySelector("#difficulty").value,
    maxTarget: Number(document.querySelector("#maxTarget").value),
    allowMultiplyDivide: document.querySelector("#allowMultiplyDivide").checked,
    liveEvaluation: document.querySelector("#liveEvaluation").checked
  };

  localStorage.setItem("hauntedCalculatorSettings", JSON.stringify(settings));

  window.location.href = "game.html";
});