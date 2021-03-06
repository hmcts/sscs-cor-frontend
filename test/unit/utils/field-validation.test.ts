const { expect } = require('test/chai-sinon');
import { answerValidation, loginEmailAddressValidation, newHearingAcceptedValidation, hearingWhyValidation, uploadDescriptionValidation } from 'app/server/utils/fieldValidation.ts';
const content = require('locale/content');

describe('utils/fieldValidation.js', () => {
  describe('answerValidation on submit', () => {
    it('returns the error message if answer is empty', () => {
      expect(answerValidation('', { body : { submit : true } })).to.equal(content.en.question.textareaField.error.empty);
    });

    it('returns the error message if answer does not meet permitted characters', () => {
      expect(answerValidation('$', { body : { submit : true } })).to.equal(content.en.question.textareaField.error.regex);
    });

    it('returns the error message if answer contains script characters', () => {
      expect(answerValidation('hello <script>alert("This is an XSS alert")</script>', { body : { submit : true } })).to.equal(content.en.question.textareaField.error.regex);
    });

    it('returns false if answer is valid', () => {
      expect(answerValidation('Valid answer', { body : { submit : true } })).to.equal(false);
    });
  });

  describe('answerValidation on save', () => {
    it('returns the error message if answer is empty', () => {
      expect(answerValidation('', { body : { submit : false } })).to.equal(content.en.question.textareaField.errorOnSave.empty);
    });

    it('returns false if answer is valid', () => {
      expect(answerValidation('Valid answer', { body : { submit : false } })).to.equal(false);
    });
  });

  describe('hearingWhyValidation', () => {

    it('returns false if answer is valid', () => {
      expect(hearingWhyValidation('Valid answer')).to.equal(false);
    });
  });

  describe('uploadDescriptionValidation', () => {
    it('returns false if answer is valid', () => {
      expect(uploadDescriptionValidation('Valid answer')).to.equal(false);
    });

    it('returns the error message if description is empty', () => {
      expect(uploadDescriptionValidation('')).to.equal(content.en.additionalEvidence.evidenceUpload.error.emptyDescription);
    });

    it('returns the error message if description has script chars', () => {
      expect(uploadDescriptionValidation('<<sc<<script>script>alert("This is an XSS alert")<</scr<</script>/script>')).to.equal(content.en.additionalEvidence.evidenceUpload.error.regex);
    });

    it('returns the error message if description has invalid chars', () => {
      expect(uploadDescriptionValidation('$ ^ @ { }')).to.equal(content.en.additionalEvidence.evidenceUpload.error.regex);
    });
  });

  describe('loginEmailAddressValidation', () => {
    it('returns the error message if answer is empty', () => {
      expect(loginEmailAddressValidation('')).to.equal(content.en.login.emailAddress.error.empty);
    });

    it('returns the error message if answer is not an email', () => {
      expect(loginEmailAddressValidation('not.an.email')).to.equal(content.en.login.emailAddress.error.format);
    });

    it('returns false if answer is valid', () => {
      expect(loginEmailAddressValidation('test@example.com')).to.equal(false);
    });
  });

  describe('newHearingAcceptedValidation', () => {
    it('returns false if answer is yes', () => {
      expect(newHearingAcceptedValidation('yes')).to.be.false;
    });

    it('returns false if answer is no', () => {
      expect(newHearingAcceptedValidation('no')).to.be.false;
    });

    it('returns empty error message is answer is anything else', () => {
      expect(newHearingAcceptedValidation('not valid')).to.equal(content.en.hearingConfirm.error.text);
    });

    it('returns empty error message is answer is missing', () => {
      expect(newHearingAcceptedValidation(undefined)).to.equal(content.en.hearingConfirm.error.text);
    });
  });
});

export {};
