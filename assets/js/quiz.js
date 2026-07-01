/* =============================================================================
 * quiz.js — "Which process group?" flashcard quiz. Draws a random process and
 * asks the user to place it in the correct process group. Exposed as `PM_QUIZ`.
 * ========================================================================== */
(function (global) {
  "use strict";

  const D = global.PM_DATA;
  const esc = (s) => global.PM_RENDER.escapeHtml(s);

  const state = { current: null, answered: false, score: 0, asked: 0 };

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function nextQuestion() {
    state.current = pick(D.allProcesses);
    state.answered = false;
    return state.current;
  }

  function render(mount, onAnswer) {
    if (!state.current) nextQuestion();
    const q = state.current;
    const options = D.PROCESS_GROUPS;

    mount.innerHTML = `
      <div class="quiz">
        <div class="quiz__scorebar">
          <span><i class="fas fa-bullseye" style="color:var(--accent)"></i> Score: ${state.score} / ${state.asked}</span>
          <button class="btn" id="quizRestart"><i class="fas fa-rotate-right"></i> Restart</button>
        </div>
        <div class="quiz__card">
          <div class="quiz__q-eyebrow">${esc(q.area)} Knowledge Area</div>
          <div class="quiz__q">${esc(q.title)}</div>
          <div class="quiz__q-sub">Which process group does this belong to?</div>
          <div class="quiz__options" id="quizOptions">
            ${options.map((o) => `<button class="quiz__opt" data-opt="${esc(o)}">${esc(o)}</button>`).join("")}
          </div>
          <div id="quizNext"></div>
        </div>
      </div>`;

    mount.querySelector("#quizRestart").addEventListener("click", () => {
      state.score = 0;
      state.asked = 0;
      nextQuestion();
      render(mount, onAnswer);
    });

    mount.querySelectorAll(".quiz__opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (state.answered) return;
        state.answered = true;
        state.asked++;
        const chosen = btn.dataset.opt;
        const correct = q.group;
        const isRight = chosen === correct;
        if (isRight) state.score++;

        mount.querySelectorAll(".quiz__opt").forEach((b) => {
          b.disabled = true;
          if (b.dataset.opt === correct) b.classList.add("correct");
          else if (b === btn) b.classList.add("wrong");
        });

        mount.querySelector("#quizNext").innerHTML =
          `<button class="btn btn--primary quiz__next" id="quizNextBtn">
             ${isRight ? "Correct! " : "Answer: " + esc(correct) + ". "} Next question <i class="fas fa-arrow-right"></i>
           </button>`;
        mount.querySelector("#quizNextBtn").addEventListener("click", () => {
          nextQuestion();
          render(mount, onAnswer);
        });
        if (typeof onAnswer === "function") onAnswer(isRight);
      });
    });
  }

  global.PM_QUIZ = { render, nextQuestion };
})(window);
