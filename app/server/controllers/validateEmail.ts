import { NextFunction, Response, Request } from 'express';
import Joi from 'joi';
import content from '../../common/locale/content.json';
import i18next from 'i18next';

import { BAD_REQUEST } from 'http-status-codes';

// Get the current language with fallback to 'en'
const getLanguage = () => i18next.language || 'en';

function setErrorFields(field, fields, result, errors) {
  fields.error = true;
  fields[field].error = true;
  fields[field].errorMessage = result.error.message;

  const type = result.error.details[0].type;
  if (type === 'string.empty' || type === 'any.required') {
    fields[field].errorHeading = errors.emptyStringHeading;
  } else {
    fields[field].errorHeading = errors.notValidHeading;
  }
  return fields;
}

const validateFields = (email: string, confirmEmail: string, errors) => {
  const schema = Joi.string()
    .required()
    .email({ minDomainSegments: 2 })
    .messages({
      'any.required': errors.emptyStringEmailField,
      'string.empty': errors.emptyStringEmailField,
      'string.email': errors.notValidField,
    });

  let fields = {
    error: false,
    email: {
      value: email,
      error: null,
      errorHeading: null,
      errorMessage: null,
    },
    confirmEmail: { value: confirmEmail, error: null, errorMessage: null },
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

export function validateEmail(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const email: string = req.body.email.trim();
  const confirmEmail: string = req.body.confirmEmail.trim();
  const errors = content[getLanguage()].notifications.email.errors;
  const fields = validateFields(email, confirmEmail, errors);
  if (fields.error) {
    res.status(BAD_REQUEST);
    res.render('notifications/email-address-change.njk', {
      mactoken: req.params.mactoken,
      fields,
    });
  } else {
    next();
  }
}
