/*
  Footballer IQ Quiz Script
  Developed by: Sebastian Cortes (hello@nevolu.com)
  Code owner: Sebastian Cortes (hello@nevolu.com)
  Date: 2022/11/15
*/

const QUIZ_HERO_ID = "quiz-hero";
const QUIZ_FORM_ID = "quiz-form";
const QUIZ_LOADER_ID = "quiz-loader";
const QUIZ_RESULTS_ID = "quiz-results";
const QUIZ_ERROR_ID = "quiz-error";
const QUIZ_START_BUTTON_ID = "quiz-start-button";
const QUIZ_QUESTIONS_ID = "quiz-questions";
const QUIZ_RADIO_QUESTIONS = 10;
const COLLECTED_ANSWERS = {};

/*
  Functions related to handling obtained results
*/

function populateQuizResults(results) {
  for (const [key, value] of Object.entries(results)) {
    if (key.includes("r-answer")) {
      const element = document.querySelector(`#${key}`);
      if (element) element.innerHTML = `${value} %`;
    }
  }

  const element = document.querySelector(`#totalVotes`);
  if (element) element.innerHTML = results.totalVotes;
}

/*
  Helper functions
*/

function collectQuizAnswers() {
  for (let i = 1; i <= QUIZ_RADIO_QUESTIONS; i++) {
    const answerValue = document.querySelector(`input[name="answerQ${i}"]:checked`)?.value;
    COLLECTED_ANSWERS[`answerQ${i}`] = +answerValue;
  }
}

function collectEmail() {
  const answerValue = document.querySelector(`input[name="email"]`).value || "";
  COLLECTED_ANSWERS[`email`] = answerValue;
}

/*
  Functions related to submitting quiz data
*/

function submitQuizData() {
  fetch("https://nevolu.autocode.dev/footballeriq@dev/submit/", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payload: { ...COLLECTED_ANSWERS },
    }),
  })
    .then(verifyResponse)
    .then(successResponse)
    .catch(errorResponse);
}

function verifyResponse(response) {
  if (!response.ok) throw Error(`${response.status}`);
  else return response.json();
}

function successResponse(response) {
  showElement(QUIZ_RESULTS_ID);
  populateQuizResults(response);
  hideElement(QUIZ_LOADER_ID);
}

function errorResponse(error) {
  showElement(QUIZ_ERROR_ID, "flex");
  hideElement(QUIZ_LOADER_ID);
}

/*
  Functions related to UI elements display
*/

function showElement(elementId, displayProperty = "block") {
  const element = document.querySelector(`#${elementId}`);
  element.style.display = displayProperty;
}

function hideElement(elementId) {
  const element = document.querySelector(`#${elementId}`);
  element.style.display = "none";
}

function scrollToElement(elementId) {
  const element = document.querySelector(`#${elementId}`);
  element.scrollIntoView({ behavior: "smooth" });
}

/*
  Functions related to handling quiz
*/

window.onload = () => {
  console.log("Welcome to Footballer IQ...");

  hideElement(QUIZ_FORM_ID);
  hideElement(QUIZ_LOADER_ID);
  hideElement(QUIZ_RESULTS_ID);
  hideElement(QUIZ_ERROR_ID);

  const quizStartButton = document.querySelector(`#${QUIZ_START_BUTTON_ID}`);
  quizStartButton.addEventListener("click", () => {
    showElement(QUIZ_FORM_ID);
    scrollToElement(QUIZ_FORM_ID);
  });

  // Disable default form submit behaviour
  const quizForm = $(`#${QUIZ_QUESTIONS_ID}`);
  quizForm.submit(function () {
    collectQuizAnswers();
    collectEmail();
    showElement(QUIZ_LOADER_ID, "flex");
    hideElement(QUIZ_HERO_ID);
    hideElement(QUIZ_FORM_ID);
    submitQuizData();
    return false;
  });
};
