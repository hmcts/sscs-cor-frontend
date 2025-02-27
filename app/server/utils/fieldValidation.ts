import { CaseDetails } from 'app/server/models/express-session';
import { dateFormat } from './dateUtils';

import i18next from 'i18next';
import content from '../../common/locale/content.json';

import Joi from 'joi';

const maxCharacters = 20000;
const minCharacters = 1;
const whitelist = /^[a-zA-ZÀ-ž0-9 \r\n."“”,'?![\]()/£:\\_+\-%&;]{2,}$/;

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
    .min(minCharacters)
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
