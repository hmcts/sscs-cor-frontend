const Joi = require('joi');
const content = require('../../../locale/content');

const maxCharacters = 20000;
const minCharecters = 1;

function uploadDescriptionValidation(description) {
  let error = false;
  const schema = Joi.string()
    .required()
    .max(maxCharacters)
    .options({
      language: {
        any: { empty: `!!${content.en.additionalEvidence.evidenceUpload.error.emptyDescription}` },
        string: { max: `!!${content.en.hearingWhy.error.maxCharacters}` }
      }
    });
  const result = schema.validate(description);
  if (result.error) {
    error = result.error.details[0].message;
  }
  return error;
}

function answerValidation(answer, req?) {

  let emptyErrorMsg = content.en.question.textareaField.errorOnSave.empty;

  // On Submit
  if (req.body.submit) {
    emptyErrorMsg = content.en.question.textareaField.error.empty;
  }

  const schema = Joi.string()
    .required()
    .min(minCharecters)
    .max(maxCharacters)
    .options({
      language: {
        any: { empty: `!!${emptyErrorMsg}` },
        string: { max: `!!${content.en.question.textareaField.error.maxCharacters}` }
      }
    });

  const result = schema.validate(answer);
  let error = false;

  if (result.error) {
    error = result.error.details[0].message;
  }

  return error;
}

function hearingWhyValidation(answer) {
  const schema = Joi.string()
    .allow('')
    .max(maxCharacters)
    .options({
      language: {
        string: { max: `!!${content.en.hearingWhy.error.maxCharacters}` }
      }
    });

  const result = schema.validate(answer);
  let error = false;

  if (result.error) {
    error = result.error.details[0].message;
  }

  return error;
}

function loginEmailAddressValidation(email) {
  const schema = Joi.string()
    .required()
    .email({ minDomainAtoms: 2 })
    .options({
      language: {
        any: { empty: `!!${content.en.login.emailAddress.error.empty}` },
        string: { email: `!!${content.en.login.emailAddress.error.format}` }
      }
    });
  const result = schema.validate(email);
  let error = false;
  if (result.error) {
    error = result.error.details[0].message;
  }
  return error;
}

function tribunalViewAcceptedValidation(acceptView, isConfirm = false) {
  const allowedValues = ['yes', 'no'];
  if (!allowedValues.includes(acceptView)) {
    if (isConfirm) {
      return content.en.tribunalView.error.emptyOnConfirm;
    } else {
      return content.en.tribunalView.error.emptyOnDecisionPick;
    }
  }
  return false;
}

function newHearingAcceptedValidation(newHearing) {
  const allowedValues = ['yes', 'no'];
  if (!allowedValues.includes(newHearing)) {
    return content.en.hearingConfirm.error.text;
  }
  return false;
}

export {
  answerValidation,
  loginEmailAddressValidation,
  tribunalViewAcceptedValidation,
  newHearingAcceptedValidation,
  hearingWhyValidation,
  uploadDescriptionValidation
};
