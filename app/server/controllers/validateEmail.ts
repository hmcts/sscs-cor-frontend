import { NextFunction, Response, Request } from 'express';
import { StringSchema, ValidationResult } from 'joi';

const content = require('../../../locale/content');
const HttpStatus = require('http-status-codes');
const Joi = require('joi');
const i18next = require('i18next');

function setErrorFields(field, fields, result, errors) {
  fields.error = true;
  fields[field].error = true;
  fields[field].errorMessage = result.error.message;

  const type = result.error.details[0].type;
  if (type === 'any.empty') {
    fields[field].errorHeading = errors.emptyStringHeading;
  } else {
    fields[field].errorHeading = errors.notValidHeading;
  }
  return fields;
}

const validateFields = (email: string, confirmEmail: string, errors) => {
  const schema: StringSchema = Joi.string()
    .email({ minDomainAtoms: 2 })
    .options({
      language: {
        any: { empty: `!!${errors.emptyStringEmailField}` },
        string: { email: `!!${errors.notValidField}` },
      },
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

  const emailResult: ValidationResult<string> = schema.validate(email);
  if (emailResult.error) {
    fields = setErrorFields('email', fields, emailResult, errors);
  }

  const emailConfirmResult: ValidationResult<string> =
    schema.validate(confirmEmail);
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
}
