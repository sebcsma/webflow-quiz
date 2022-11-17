module.exports = async (payload, context) => {
  const lib = require("lib")({ token: process.env.STDLIB_SECRET_TOKEN });
  const answerKey = "answer";

  // 1) Get current results
  const currentResults = await lib.airtable.query["@1.0.0"].records.retrieve({
    baseId: `appatwN6c5rbcIaLA`,
    table: `qatarTriviaResults`,
    id: `rec9hI4fDk920sFaV`,
  });

  // 2) Based on user answers, calculate new current results
  const newCurrentResults = calcNewCurrentResults(context.params.payload, currentResults.fields, answerKey);

  // 3) Update current results with newly calculate results
  const updatedResults = await lib.airtable.query["@1.0.0"].records.update({
    baseId: `appatwN6c5rbcIaLA`,
    table: `qatarTriviaResults`,
    id: `rec9hI4fDk920sFaV`,
    fields: { ...newCurrentResults },
  });

  delete updatedResults.fields.resultId;

  // 4) Combine and submit user answers with updated results
  const userSubmission = {
    ...context.params.payload,
    ...updatedResults.fields,
  };

  const submittedUserData = await lib.airtable.query["@1.0.0"].insert({
    baseId: `appatwN6c5rbcIaLA`,
    table: `qatarTriviaSubmissions`,
    fieldsets: [{ ...userSubmission }],
    typecast: false,
  });

  // 5) Get results as percentages of all votes
  const updatedResultsAsPercentage = calcResultsAsPercentage(submittedUserData.rows[0].fields, answerKey);

  // 6) Calculate # of correct answers
  const totalCorrectAnswers = calcCorrectAnswers(submittedUserData.rows[0].fields, answerKey);

  // 7) Calculate quiz position
  const quizPosition = 5;

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
