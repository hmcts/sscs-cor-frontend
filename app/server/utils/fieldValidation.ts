const i18next = require('i18next');
const Joi = require('joi');

const content = require('../../../locale/content');

const maxCharacters = 20000;
const minCharecters = 1;
const whitelist = /^[a-zA-ZÀ-ž0-9 \r\n."“”,'?![\]()/£:\\_+\-%&;]{2,}$/;

function uploadDescriptionValidation(description) {
  const schema = Joi.string()
    .required()
    .max(maxCharacters)
    .regex(whitelist)
    .options({
      language: {
        any: {
          empty: `!!${
            content[i18next.language].additionalEvidence.evidenceUpload.error
              .emptyDescription
          }`,
        },
        string: {
          max: `!!${content[i18next.language].hearingWhy.error.maxCharacters}`,
          regex: {
            base: `!!${
              content[i18next.language].additionalEvidence.evidenceUpload.error
                .regex
            }`,
          },
        },
      },
    });
  const result = schema.validate(description);

  if (result.error) {
    return result.error.details[0].message;
  }
  return false;
}

function answerValidation(answer, req?) {
  let emptyErrorMsg =
    content[i18next.language].question.textareaField.errorOnSave.empty;

  // On Submit
  if (req.body.submit) {
    emptyErrorMsg =
      content[i18next.language].question.textareaField.error.empty;
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
          max: `!!${
            content[i18next.language].question.textareaField.error.maxCharacters
          }`,
          regex: {
            base: `!!${
              content[i18next.language].question.textareaField.error.regex
            }`,
          },
        },
      },
    });

  const result = schema.validate(answer);

  if (result.error) {
    return result.error.details[0].message;
  }

  return false;
}

function hearingWhyValidation(answer) {
  const schema = Joi.string()
    .allow('')
    .max(maxCharacters)
    .options({
      language: {
        string: {
          max: `!!${content[i18next.language].hearingWhy.error.maxCharacters}`,
        },
      },
    });

  const result = schema.validate(answer);

  if (result.error) {
    return result.error.details[0].message;
  }

  return false;
}

function loginEmailAddressValidation(email) {
  const schema = Joi.string()
    .required()
    .email({ minDomainAtoms: 2 })
    .options({
      language: {
        any: {
          empty: `!!${
            content[i18next.language].login.emailAddress.error.empty
          }`,
        },
        string: {
          email: `!!${
            content[i18next.language].login.emailAddress.error.format
          }`,
        },
      },
    });
  const result = schema.validate(email);

  if (result.error) {
    return result.error.details[0].message;
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

function getHearingsByName(hearings) {
  const hearingsByName = {};
  hearings.forEach((hearing) => {
    const appellantName = hearing.appellant_name;
    if (!hearingsByName[appellantName]) {
      hearingsByName[appellantName] = [];
    }
    hearingsByName[appellantName].push(hearing);
  });
  return hearingsByName;
}

export {
  answerValidation,
  loginEmailAddressValidation,
  newHearingAcceptedValidation,
  hearingWhyValidation,
  uploadDescriptionValidation,
  getHearingsByName,
};
