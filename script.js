window.onload = () => {
  console.log("Welcome to Footballer IQ...");

  // Disable default form submit behaviour
  const quizForm = $("#quiz-form");
  quizForm.submit(function () {
    submitQuizData();
    return false;
  });
};

function submitQuizData() {
  const QUIZ_RADIO_QUESTIONS = 10;
  const COLLECTED_ANSWERS = {};

  collectQuizAnswers();
  collectEmail();

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

  function verifyResponse(response) {
    if (!response.ok) throw Error(`${response.status}-${response.statusText}`);
    else return response.json();
  }

  function successResponse(response) {
    console.log(`Submission success: ${JSON.stringify(response)}`);
  }

  function errorResponse(error) {
    console.log(`Submission error: ${error}`);
  }
}
