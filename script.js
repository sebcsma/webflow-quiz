/*
  Webflow Quiz Script
  Developed by: Sebastian Cortes (hello@nevolu.com)
  Code owner: Sebastian Cortes (hello@nevolu.com)
  Date: 2022/11/15
*/

const COLLECTED_ANSWERS = {};
const QUIZ_TOTAL_QUESTIONS = 10;
const ANSWER_KEY = "answer";
const QUIZ_SECTION_HERO_ID = "quiz-section-hero";
const QUIZ_SECTION_FORM_ID = "quiz-section-form";
const QUIZ_SECTION_LOADER_ID = "quiz-section-loader";
const QUIZ_SECTION_RESULTS_ID = "quiz-section-results";
const QUIZ_SECTION_ERROR_ID = "quiz-section-error";
const QUIZ_START_BUTTON_ID = "quiz-start-button";
const QUIZ_FORM_ID = "quiz-form";
const QUIZ_QUESTIONS_ID = "quiz-questions";
const QUIZ_EMAIL_ID = "quiz-email";
const QUIZ_CTA_ID = "quiz-cta";
const QUIZ_CORRECT_ANSWERS_ID = "quiz-correct-answers";
const QUIZ_POSITION_ID = "quiz-position";
const QUIZ_TOTAL_VOTES_ID = "quiz-total-votes";
const QUIZ_SHARE_TWITTER_ID = "quiz-share-twitter";
const QUIZ_SHARE_FACEBOOK_ID = "quiz-share-facebook";

/*
  Functions related to using obtained results
*/

function populateQuizResults(results) {
  populateAnswers(results, ANSWER_KEY);
  populateElement(QUIZ_CORRECT_ANSWERS_ID, results.totalCorrectAnswers);
  populateElement(QUIZ_POSITION_ID, results.quizPosition);
  populateElement(QUIZ_TOTAL_VOTES_ID, results.totalVotes);
}

function populateAnswers(results, answerKey) {
  for (const [key, value] of Object.entries(results)) {
    if (key.includes(`r-${answerKey}`)) {
      populateElement(key, value, "% votes");
    }
  }
}

function populateElement(elementId, value, symbol = "") {
  const element = document.querySelector(`#${elementId}`);
  if (element) element.innerHTML = `${value}${symbol}`;
}

/*
  Functions related to collecting user data
*/

function collectQuizAnswers() {
  for (let i = 1; i <= QUIZ_TOTAL_QUESTIONS; i++) {
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
  showElement(QUIZ_SECTION_RESULTS_ID);
  populateQuizResults(response);
  enableQuizSharing(response);
  hideElement(QUIZ_SECTION_LOADER_ID);
}

function errorResponse(error) {
  showElement(QUIZ_SECTION_ERROR_ID, "flex");
  hideElement(QUIZ_SECTION_LOADER_ID);
}

/*
  Functions related to UI elements display / animations
*/

function addQuestionsAnimations(elementId) {
  const questionsParent = document.querySelector(`#${elementId}`);
  const questionsList = Object.entries(questionsParent.children);
  const questionsQuantity = questionsList.length;

  for (const [key, question] of questionsList) {
    // as last questions does not have next question
    if (key === `${questionsQuantity - 1}`) continue;
    const nextQuestion = questionsList[+key + 1][1];
    onAnswerClickShowNextQuestion(question, nextQuestion);
  }
}

function onAnswerClickShowNextQuestion(question, nextQuestion) {
  const answers = question.querySelectorAll("input");
  console.log(answers);
}

function hideElement(elementId) {
  const element = document.querySelector(`#${elementId}`);
  element.style.display = "none";
}

function hideQuestions(elementId) {
  const questionsParent = document.querySelector(`#${elementId}`);
  for (const [key, question] of Object.entries(questionsParent.children)) {
    // as we want to show first question
    if (key === "0") continue;
    question.style.display = "none";
  }
}

function showElement(elementId, displayProperty = "block") {
  const element = document.querySelector(`#${elementId}`);
  element.style.display = displayProperty;
}

function scrollToElement(elementId) {
  const element = document.querySelector(`#${elementId}`);
  element.scrollIntoView({ behavior: "smooth" });
}

/*
  Functions related to sharing quiz
*/

function enableQuizSharing(results) {
  const shareFacebookButton = document.querySelector(`#${QUIZ_SHARE_FACEBOOK_ID}`);
  shareFacebookButton.addEventListener("click", () => {
    shareQuizOnFacebook();
  });

  const shareTwitterButton = document.querySelector(`#${QUIZ_SHARE_TWITTER_ID}`);
  shareTwitterButton.addEventListener("click", () => {
    shareQuizOnTwitter(results);
  });
}

function shareQuizOnFacebook() {
  const shareUrl = window.location.href;
  // Haven't found how to share text as well
  window.open(`https://facebook.com/sharer.php?u=${encodeURIComponent(shareUrl)}`);
}

function shareQuizOnTwitter(results) {
  const shareUrl = window.location.href;
  const shareText = `I took the Qatar 2022 World Cup trivia. With ${results.totalCorrectAnswers}/${QUIZ_TOTAL_QUESTIONS} answer(s) correct, I did better than ${results.quizPosition}% of participants! Can you do better than me?`;
  const shareTextTwitterLike = shareText
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/, "'");
  window.open(`https://twitter.com/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTextTwitterLike).replace(/'/g, "%27")}`);
}

/*
  Functions related to handling quiz
*/

window.onload = () => {
  hideElement(QUIZ_SECTION_FORM_ID);
  hideElement(QUIZ_SECTION_LOADER_ID);
  hideElement(QUIZ_SECTION_RESULTS_ID);
  hideElement(QUIZ_SECTION_ERROR_ID);
  // hideElement(QUIZ_EMAIL_ID);
  // hideElement(QUIZ_CTA_ID);
  // hideQuestions(QUIZ_QUESTIONS_ID);
  // addQuestionsAnimations(QUIZ_QUESTIONS_ID);

  const quizStartButton = document.querySelector(`#${QUIZ_START_BUTTON_ID}`);
  quizStartButton.addEventListener("click", () => {
    showElement(QUIZ_SECTION_FORM_ID);
    scrollToElement(QUIZ_SECTION_FORM_ID);
  });

  // Disable default Webflow form submit behaviour
  const quizForm = $(`#${QUIZ_FORM_ID}`);
  quizForm.submit(function () {
    collectQuizAnswers();
    collectEmail();
    showElement(QUIZ_SECTION_LOADER_ID, "flex");
    hideElement(QUIZ_SECTION_HERO_ID);
    hideElement(QUIZ_SECTION_FORM_ID);
    submitQuizData();
    return false;
  });
};
