import { CaseDetails } from 'app/server/models/express-session';
import { dateFormat } from './dateUtils';

import i18next from 'i18next';
import content from '../../common/locale/content.json';

import Joi from 'joi';

const maxCharacters = 20000;
const minCharacters = 1;
const whitelist = /^[a-zA-ZÀ-ž0-9 \r\n."“”,'?![\]()/£:\\_+\-%&;]{2,}$/;

// Get the current language with fallback to 'en'
const getLanguage = () => i18next.language || 'en';

export interface Attribute {
  attribute: string;
  value: string;
}

export interface GovTableRow {
  text?: string;
  html?: string;
  format?: string;
  classes?: string;
  colspan?: number;
  rowspan?: number;
  attributes?: Array<Attribute>;
}

function uploadDescriptionValidation(description) {
  const schema = Joi.string()
    .required()
    .max(maxCharacters)
    .pattern(whitelist)
    .messages({
      'any.required':
        content[getLanguage()].additionalEvidence.evidenceUpload.error
          .emptyDescription,
      'string.empty':
        content[getLanguage()].additionalEvidence.evidenceUpload.error
          .emptyDescription,
      'string.max': content[getLanguage()].hearingWhy.error.maxCharacters,
      'string.pattern.base':
        content[getLanguage()].additionalEvidence.evidenceUpload.error.regex,
    });
  const result = schema.validate(description);

  if (result.error) {
    return result.error.details[0].message;
  }
  return false;
}

function answerValidation(answer, req?) {
  let emptyErrorMsg =
    content[getLanguage()].question.textareaField.errorOnSave.empty;

  // On Submit
  if (req.body.submit) {
    emptyErrorMsg = content[getLanguage()].question.textareaField.error.empty;
  }

  const schema = Joi.string()
    .required()
    .min(minCharacters)
    .max(maxCharacters)
    .pattern(whitelist)
    .messages({
      'any.required': emptyErrorMsg,
      'string.empty': emptyErrorMsg,
      'string.max':
        content[getLanguage()].question.textareaField.error.maxCharacters,
      'string.pattern.base':
        content[getLanguage()].question.textareaField.error.regex,
    });

  const result = schema.validate(answer);

  if (result.error) {
    return result.error.details[0].message;
  }

  return false;
}

function hearingWhyValidation(answer) {
  const schema = Joi.string().allow('').max(maxCharacters).messages({
    'string.max': content[getLanguage()].hearingWhy.error.maxCharacters,
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
    .email({ minDomainSegments: 2 })
    .messages({
      'any.required': content[getLanguage()].login.emailAddress.error.empty,
      'string.empty': content[getLanguage()].login.emailAddress.error.empty,
      'string.email': content[getLanguage()].login.emailAddress.error.format,
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
    return content[getLanguage()].hearingConfirm.error.text;
  }
  return false;
}

function getCasesByName(cases: Array<CaseDetails>): {
  [key: string]: Array<CaseDetails>;
} {
  const casesByName: { [key: string]: Array<CaseDetails> } = {};
  cases?.forEach((value) => {
    const appellantName: string = value.appellant_name;
    if (!casesByName[appellantName]) {
      casesByName[appellantName] = [];
    }
    casesByName[appellantName].push(value);
  });
  return casesByName;
}

function getCasesRow(casedetails: CaseDetails): Array<GovTableRow> {
  const caseReference = String(casedetails.case_id);
  const benefitType: string =
    casedetails?.appeal_details?.benefit_type?.toLowerCase();
  const language: string = i18next.language;
  const benefitAcronym: string =
    content[language]?.benefitTypes[benefitType]?.acronym;
  const submittedDate: string = casedetails?.appeal_details?.submitted_date;
  const mrnDate: string = casedetails?.appeal_details?.mrn_date;
  const viewLabel: string = content[language]?.selectCase?.view;

  return [
    { text: caseReference },
    { text: benefitAcronym },
    { text: dateFormat(submittedDate, 'DD MMMM YYYY', language) },
    { text: dateFormat(mrnDate, 'DD MMMM YYYY', language) },
    {
      html: `<a href="/sign-in?code=dummy&caseId=${casedetails.case_id}">${viewLabel}</a>`,
    },
  ];
}

function getCasesByNameAndRow(cases: Array<CaseDetails>): {
  [key: string]: Array<Array<GovTableRow>>;
} {
  const casesByName: { [key: string]: Array<Array<GovTableRow>> } = {};
  cases?.forEach((value) => {
    const appellantName: string = value.appellant_name;
    if (!casesByName[appellantName]) {
      casesByName[appellantName] = [];
    }
    const row: Array<GovTableRow> = getCasesRow(value);
    casesByName[appellantName].push(row);
  });
  return casesByName;
}

export {
  answerValidation,
  loginEmailAddressValidation,
  newHearingAcceptedValidation,
  hearingWhyValidation,
  uploadDescriptionValidation,
  getCasesByName,
  getCasesByNameAndRow,
};
