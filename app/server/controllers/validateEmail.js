const { setErrorFields } = require('../../core/fieldErrors');
const content = require('../../../locale/content');
const HttpStatus = require('http-status-codes');
const Joi = require('joi');
const i18next = require('i18next');

const validateFields = (email, confirmEmail, errors) => {
  const schema = Joi.string()
    .email({ minDomainAtoms: 2 })
    .options({
      language: {
        any: { empty: `!!${errors.emptyStringEmailField}` },
        string: { email: `!!${errors.notValidField}` },
      },
    });

  let fields = {
    error: false,
    email: { value: email },
    confirmEmail: { value: confirmEmail },
  };

  const emailResult = schema.validate(email);
  if (emailResult.error) {
    fields = setErrorFields('email', fields, emailResult, errors);
  }

  const emailConfirmResult = schema.validate(confirmEmail);
  if (emailConfirmResult.error) {
    fields = setErrorFields('confirmEmail', fields, emailConfirmResult, errors);
  }

  if (fields.error) {
    return fields;
  }

  if (email !== confirmEmail) {
    fields.error = true;
    fields.email.error = true;
    fields.email.errorHeading = errors.noMatchHeading;
    fields.email.errorMessage = errors.noMatchField;
    fields.confirmEmail.error = true;
    fields.confirmEmail.errorMessage = errors.noMatchField;
  }

  return fields;
};

const validateEmail = (req, res, next) => {
  const email = req.body.email.trim();
  const confirmEmail = req.body.confirmEmail.trim();
  const errors = content[i18next.language].notifications.email.errors;
  const fields = validateFields(email, confirmEmail, errors);
  if (fields.error) {
    res.status(HttpStatus.BAD_REQUEST);
    res.render('email-address-change.njk', {
      mactoken: req.params.mactoken,
      fields,
    });
  } else {
    next();
  }
};

module.exports = { validateEmail };
