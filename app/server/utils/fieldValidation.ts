const Joi = require('joi');
const i18n = require('../../../locale/en');

const maxCharacters = 20000;

function answerValidation(answer, req) {

  let emptyErrorMsg = i18n.question.textareaField.errorOnSave.empty;

  // On Submit
  if (req.body.submit) {
    emptyErrorMsg = i18n.question.textareaField.error.empty;
  }

  const schema = Joi.string()
    .required()
    .max(maxCharacters)
    .options({
      language: {
        any: { empty: `!!${emptyErrorMsg}` },
        string: { max: `!!${i18n.question.textareaField.error.maxCharacters}` }
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
        string: { max: `!!${i18n.hearingWhy.error.maxCharacters}` }
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
        any: { empty: `!!${i18n.login.emailAddress.error.empty}` },
        string: { email: `!!${i18n.login.emailAddress.error.format}` }
      }
    });
  const result = schema.validate(email);
  let error = false;
  if (result.error) {
    error = result.error.details[0].message;
  }
  return error;
}

function tribunalViewAcceptedValidation(acceptView) {
  const allowedValues = ['yes', 'no'];
  if (!allowedValues.includes(acceptView)) {
    return i18n.tribunalView.error.empty;
  }
  return false;
}

function newHearingAcceptedValidation(newHearing) {
  const allowedValues = ['yes', 'no'];
  if (!allowedValues.includes(newHearing)) {
    return i18n.hearingConfirm.error.text;
  }
  return false;
}

export {
  answerValidation,
  loginEmailAddressValidation,
  tribunalViewAcceptedValidation,
  newHearingAcceptedValidation,
  hearingWhyValidation
};
