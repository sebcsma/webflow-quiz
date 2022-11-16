module.exports = async (payload, context) => {
  const lib = require("lib")({ token: process.env.STDLIB_SECRET_TOKEN });

  // 1) Get current results
  const currentResults = await lib.airtable.query["@1.0.0"].records.retrieve({
    baseId: `appatwN6c5rbcIaLA`,
    table: `qatarTriviaResults`,
    id: `rec9hI4fDk920sFaV`,
  });

  // 2) Based on user answers, calculate new current results
  const newCurrentResults = calcNewCurrentResults(context.params.payload, currentResults.fields);

  // 3) Update current results with newly calculate results
  const updatedResults = await lib.airtable.query["@1.0.0"].records.update({
    baseId: `appatwN6c5rbcIaLA`,
    table: `qatarTriviaResults`,
    id: `rec9hI4fDk920sFaV`,
    fields: { ...newCurrentResults },
  });

  delete updatedResults.fields.resultId;

  // 4) Get results as percentages of all votes
  const updatedResultsAsPercentage = calcResultsAsPercentage(updatedResults.fields);

  // 5) Combine user answers with newly calculated current results
  const userSubmission = {
    ...context.params.payload,
    ...updatedResultsAsPercentage,
    totalVotes: updatedResults.fields.totalVotes,
  };

  // 6) Submit user answers along with newly calculated results
  const submittedUserData = await lib.airtable.query["@1.0.0"].insert({
    baseId: `appatwN6c5rbcIaLA`,
    table: `qatarTriviaSubmissions`,
    fieldsets: [{ ...userSubmission }],
    typecast: false,
  });

  return submittedUserData.rows[0].fields;
};

function calcResultsAsPercentage(results) {
  const resultsAsPercentage = {};
  for (const [key, value] of Object.entries(results)) {
    if (key.includes("answer")) {
      resultsAsPercentage[key] = Math.round((value / results.totalVotes) * 100);
    }
  }
  return resultsAsPercentage;
}

function calcNewCurrentResults(userAnswers, currentResults) {
  const results = {};
  results["totalVotes"] = currentResults["totalVotes"] + 1;

  for (const [key, value] of Object.entries(userAnswers)) {
    if (key.includes("answer")) {
      if (value === 1) results[`r-${key}A1`] = currentResults[`r-${key}A1`] + 1;
      if (value === 2) results[`r-${key}A2`] = currentResults[`r-${key}A2`] + 1;
      if (value === 3) results[`r-${key}A3`] = currentResults[`r-${key}A3`] + 1;
      if (value === 4) results[`r-${key}A4`] = currentResults[`r-${key}A4`] + 1;
    }
  }

  return results;
}
