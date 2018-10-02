const Joi = require('joi');
const i18n = require('../locale/en.json');

const maxCharacters = 10000;

function answerValidation(answer) {
  const schema = Joi.string()
    .required()
    .max(maxCharacters)
    .options({
      language: {
        any: { empty: `!!${i18n.question.textareaField.error.empty}` },
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

export {
  answerValidation,
  loginEmailAddressValidation
};
