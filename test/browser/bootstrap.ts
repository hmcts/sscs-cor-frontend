const coh = require('test/fixtures/coh')
const ccd = require('test/fixtures/ccd')

async function waitForQuestionRoundIssued(hearingId, roundNum, attemptNum) {
  const MAX_ATTEMPTS = 30
  const DELAY_BETWEEN_ATTEMPTS_MS = 1000
  const currentAttemptNum = attemptNum || 1
  if (currentAttemptNum > MAX_ATTEMPTS) {
    return Promise.reject(new Error(`Question round not issued after ${MAX_ATTEMPTS} attempts`))
  }
  const questionRound = await coh.getQuestionRound(hearingId, roundNum)
  const questionRoundState = questionRound.question_round_state.state_name
  if (questionRoundState !== 'question_issued') {
    console.log(`Question round not issued at attempt ${currentAttemptNum}: ${questionRoundState}`)
    await new Promise(r => setTimeout(r, DELAY_BETWEEN_ATTEMPTS_MS))
    const nextAttemptNum = currentAttemptNum + 1
    return await waitForQuestionRoundIssued(hearingId, roundNum, nextAttemptNum)
  }
  console.log(`Question round issued successfully at attempt ${currentAttemptNum}`)
  return Promise.resolve(questionRound)
}

/* eslint-disable-next-line consistent-return */
async function bootstrapCoh(ccdCase) {
  try {
    const hearingId = await coh.createOnlineHearing(ccdCase.caseId)
    const question = await coh.createQuestion(hearingId)
    const questionId = question.question_id
    await coh.setQuestionRoundToIssued(hearingId)
    const questionRound = await waitForQuestionRoundIssued(hearingId, 1, null)
    const questionHeader = questionRound.question_references[0].question_header_text
    const questionBody = questionRound.question_references[0].question_body_text
    const deadlineExpiryDate = questionRound.question_references[0].deadline_expiry_date
    return { hearingId, questionId, questionHeader, questionBody, deadlineExpiryDate }
  } catch (error) {
    console.log('Error bootstrapping COH with test data', error)
    return Promise.reject(error)
  }
}

async function bootstrapCcdCase() {
  try {
    const ccdCase = await ccd.createCase()
    return ccdCase
  } catch (error) {
    console.log('Error bootstrapping CCD with test case', error)
    return Promise.reject(error)
  }
}

export async function bootstrap() {
  try {
    const ccdCase = await bootstrapCcdCase()
    const cohTestData = await bootstrapCoh(ccdCase)
    return { ccdCase, cohTestData }
  } catch (error) {
    return Promise.reject(error)
  }
}
