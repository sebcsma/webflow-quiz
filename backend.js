/*
  Webflow Quiz Script
  Developed by: Sebastian Cortes (hello@nevolu.com)
  Code owner: Sebastian Cortes (hello@nevolu.com)
  Date: 2022/11/15
*/

module.exports = async (payload, context) => {
  const lib = require("lib")({ token: process.env.STDLIB_SECRET_TOKEN });
  const ANSWER_KEY = "answer";
  const AIRTABLE_BASE_ID = "appatwN6c5rbcIaLA";
  const AIRTABLE_RESULTS_TABLE = "qatarTriviaResults";
  const AIRTABLE_RESULTS_TABLE_ROW_ID = "rec9hI4fDk920sFaV";
  const AIRTABLE_SUBMISSIONS_TABLE = "qatarTriviaSubmissions";

  // 1) Get current results
  const currentResults = await lib.airtable.query["@1.0.0"].records.retrieve({
    baseId: AIRTABLE_BASE_ID,
    table: AIRTABLE_RESULTS_TABLE,
    id: AIRTABLE_RESULTS_TABLE_ROW_ID,
  });

  // 2) Based on user answers, calculate new current results
  const newCurrentResults = calcNewCurrentResults(context.params.payload, currentResults.fields, ANSWER_KEY);

  // 3) Update current results with newly calculate results
  const updatedResults = await lib.airtable.query["@1.0.0"].records.update({
    baseId: AIRTABLE_BASE_ID,
    table: AIRTABLE_RESULTS_TABLE,
    id: AIRTABLE_RESULTS_TABLE_ROW_ID,
    fields: { ...newCurrentResults },
  });

  delete updatedResults.fields.resultId;

  // 4) Combine and submit user answers with updated results
  const userSubmission = {
    ...context.params.payload,
    ...updatedResults.fields,
  };

  const submittedUserData = await lib.airtable.query["@1.0.0"].insert({
    baseId: AIRTABLE_BASE_ID,
    table: AIRTABLE_SUBMISSIONS_TABLE,
    fieldsets: [{ ...userSubmission }],
    typecast: false,
  });

  // 5) Get results as percentages of all votes
  const updatedResultsAsPercentage = calcResultsAsPercentage(submittedUserData.rows[0].fields, ANSWER_KEY);

  // 6) Calculate # of correct answers
  const totalCorrectAnswers = calcCorrectAnswers(submittedUserData.rows[0].fields, ANSWER_KEY);

  // 7) Calculate quiz position
  const quizPosition = calcQuizPosition(totalCorrectAnswers);

  // 8) Return answers and stats
  return {
    ...submittedUserData.rows[0].fields,
    ...updatedResultsAsPercentage,
    totalCorrectAnswers,
    quizPosition,
  };
};

function calcCorrectAnswers(userData, answerKey) {
  let totalCorrectAnswers = 0;
  const correctAnswers = {
    [`${answerKey}Q1`]: 4,
    [`${answerKey}Q2`]: 4,
    [`${answerKey}Q3`]: 4,
    [`${answerKey}Q4`]: 4,
    [`${answerKey}Q5`]: 4,
    [`${answerKey}Q6`]: 4,
    [`${answerKey}Q7`]: 4,
    [`${answerKey}Q8`]: 4,
    [`${answerKey}Q9`]: 4,
    [`${answerKey}Q10`]: 4,
  };

  for (const [key, value] of Object.entries(userData)) {
    if (key.includes(`${answerKey}`) && !key.includes(`r-${answerKey}`)) {
      if (value === correctAnswers[key]) totalCorrectAnswers += 1;
    }
  }

  return totalCorrectAnswers;
}

function calcQuizPosition(totalCorrectAnswers) {
  // For this stage, quiz position is not developed
  switch (totalCorrectAnswers) {
    case 1:
      return 4;
    case 2:
      return 12;
    case 3:
      return 21;
    case 4:
      return 33;
    case 5:
      return 41;
    case 6:
      return 54;
    case 7:
      return 67;
    case 8:
      return 83;
    case 9:
      return 91;
    case 10:
      return 96;
    default:
      return 0;
  }
}

function calcResultsAsPercentage(results, answerKey) {
  const resultsAsPercentage = {};
  for (const [key, value] of Object.entries(results)) {
    if (key.includes(`r-${answerKey}`)) {
      resultsAsPercentage[key] = Math.round((value / results.totalVotes) * 100);
    }
  }
  return resultsAsPercentage;
}

function calcNewCurrentResults(userAnswers, currentResults, answerKey) {
  const results = {};
  results["totalVotes"] = currentResults["totalVotes"] + 1;

  for (const [key, value] of Object.entries(userAnswers)) {
    if (key.includes(answerKey)) {
      if (value === 1) results[`r-${key}A1`] = currentResults[`r-${key}A1`] + 1;
      if (value === 2) results[`r-${key}A2`] = currentResults[`r-${key}A2`] + 1;
      if (value === 3) results[`r-${key}A3`] = currentResults[`r-${key}A3`] + 1;
      if (value === 4) results[`r-${key}A4`] = currentResults[`r-${key}A4`] + 1;
    }
  }

  return results;
}
