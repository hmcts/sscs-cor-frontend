const i18next = require('i18next');
const Joi = require('joi');
const content = require('../../../locale/content');

const maxCharacters = 20000;
const minCharecters = 1;
const whitelist = /^[a-zA-ZÀ-ž0-9 \r\n."“”,'?![\]()/£:\\_+\-%&;]{2,}$/;

function uploadDescriptionValidation(description) {
  let error = false;
  const schema = Joi.string()
    .required()
    .max(maxCharacters)
    .regex(whitelist)
    .options({
      language: {
        any: {
          empty: `!!${content[i18next.language].additionalEvidence.evidenceUpload.error.emptyDescription}`
        },
        string: {
          max: `!!${content[i18next.language].hearingWhy.error.maxCharacters}`,
          regex: {
            base: `!!${content[i18next.language].additionalEvidence.evidenceUpload.error.regex}`
          }
        }
      }
    });
  const result = schema.validate(description);

  if (result.error) {
    error = result.error.details[0].message;
  }
  return error;
}

function answerValidation(answer, req?) {

  let emptyErrorMsg = content[i18next.language].question.textareaField.errorOnSave.empty;

  // On Submit
  if (req.body.submit) {
    emptyErrorMsg = content[i18next.language].question.textareaField.error.empty;
  }

  const schema = Joi.string()
    .required()
    .min(minCharecters)
    .max(maxCharacters)
    .regex(whitelist)
    .options({
      language: {
        any: { empty: `!!${emptyErrorMsg}` },
        string: {
          max: `!!${content[i18next.language].question.textareaField.error.maxCharacters}`,
          regex: {
            base: `!!${content[i18next.language].question.textareaField.error.regex}`
          }
        }
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
        string: { max: `!!${content[i18next.language].hearingWhy.error.maxCharacters}` }
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
        any: { empty: `!!${content[i18next.language].login.emailAddress.error.empty}` },
        string: { email: `!!${content[i18next.language].login.emailAddress.error.format}` }
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
      return content[i18next.language].tribunalView.error.emptyOnConfirm;
    } else {
      return content[i18next.language].tribunalView.error.emptyOnDecisionPick;
    }
  }
  return false;
}

function newHearingAcceptedValidation(newHearing) {
  const allowedValues = ['yes', 'no'];
  if (!allowedValues.includes(newHearing)) {
    return content[i18next.language].hearingConfirm.error.text;
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
