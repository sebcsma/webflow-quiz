/*
  Webflow Quiz Script
  Developed by: Sebastian Cortes (hello@nevolu.com)
  Code owner: Sebastian Cortes (hello@nevolu.com)
  Date: 2022/11/15
*/

const ANSWER_KEY = "answer";
const ANSWER_CLASS_WRONG = "c-wrong";
const ANSWER_CLASS_CHOSEN = "c-chosen";
const COLLECTED_ANSWERS = {};
const QUIZ_TOTAL_QUESTIONS = 10;
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
  showElementById(QUIZ_SECTION_RESULTS_ID);
  highlightUserAnswers(response);
  populateQuizResults(response);
  enableQuizSharing(response);
  hideElementById(QUIZ_SECTION_LOADER_ID);
}

function errorResponse(error) {
  showElementById(QUIZ_SECTION_ERROR_ID, "flex");
  hideElementById(QUIZ_SECTION_LOADER_ID);
}

/*
  Functions related to UI elements display / animations
*/

function getQuestions() {
  const questionsList = [];
  for (var i = 1; i <= QUIZ_TOTAL_QUESTIONS; i++) {
    const question = document.querySelector(`#question${i}`);
    questionsList.push(question);
  }
  return questionsList;
}

function addQuestionsAnimations(questions) {
  questions.forEach((question, index) => {
    const questionAnswers = question.querySelectorAll("li");
    questionAnswers.forEach((answer) => {
      // As last question goes to Email
      if (index + 1 === questions.length) {
        answer.addEventListener("click", () => {
          showElementById(QUIZ_EMAIL_ID);
          showElementById(QUIZ_CTA_ID);
          scrollToElementById(QUIZ_EMAIL_ID);
        });
      } else {
        answer.addEventListener("click", () => {
          const nextQuestion = questions[index + 1];
          nextQuestion.style.display = "block";
          nextQuestion.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    });
  });
}

function highlightUserAnswers(answers) {
  for (var i = 1; i <= QUIZ_TOTAL_QUESTIONS; i++) {
    const answerValue = answers[`answerQ${i}`];
    const answer = document.querySelector(`#answerQ${i}A${answerValue}`);
    if (Object.values(answer.classList).includes(ANSWER_CLASS_WRONG)) {
      answer.classList.remove(ANSWER_CLASS_WRONG);
      answer.classList.add(ANSWER_CLASS_CHOSEN);
    }
  }
}

function hideQuestions(questions) {
  questions.forEach((question, index) => {
    if (index === 0) return; // as we want to show first question
    question.style.display = "none";
  });
}

function hideElementById(elementId) {
  const element = document.querySelector(`#${elementId}`);
  element.style.display = "none";
}

function showElementById(elementId, displayProperty = "block") {
  const element = document.querySelector(`#${elementId}`);
  element.style.display = displayProperty;
}

function scrollToElementById(elementId) {
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
  hideElementById(QUIZ_SECTION_FORM_ID);
  hideElementById(QUIZ_SECTION_LOADER_ID);
  hideElementById(QUIZ_SECTION_RESULTS_ID);
  hideElementById(QUIZ_SECTION_ERROR_ID);
  hideElementById(QUIZ_EMAIL_ID);
  hideElementById(QUIZ_CTA_ID);
  hideQuestions(getQuestions());
  addQuestionsAnimations(getQuestions());

  const quizStartButton = document.querySelector(`#${QUIZ_START_BUTTON_ID}`);
  quizStartButton.addEventListener("click", () => {
    showElementById(QUIZ_SECTION_FORM_ID);
    scrollToElementById(QUIZ_SECTION_FORM_ID);
  });

  // Disable default Webflow form submit behaviour
  const quizForm = $(`#${QUIZ_FORM_ID}`);
  quizForm.submit(function () {
    collectQuizAnswers();
    collectEmail();
    showElementById(QUIZ_SECTION_LOADER_ID, "flex");
    hideElementById(QUIZ_SECTION_HERO_ID);
    hideElementById(QUIZ_SECTION_FORM_ID);
    submitQuizData();
    return false;
  });
};
