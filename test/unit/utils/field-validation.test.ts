const { expect } = require('test/chai-sinon');
import { answerValidation, loginEmailAddressValidation, tribunalViewAcceptedValidation, newHearingAcceptedValidation, hearingWhyValidation, uploadDescriptionValidation } from 'app/server/utils/fieldValidation.ts';
const i18n = require('locale/en');

describe('utils/fieldValidation.js', () => {
  describe('answerValidation on submit', () => {
    it('returns the error message if answer is empty', () => {
      expect(answerValidation('', { body : { submit : true } })).to.equal(i18n.question.textareaField.error.empty);
    });

    it('returns false if answer is valid', () => {
      expect(answerValidation('Valid answer', { body : { submit : true } })).to.equal(false);
    });
  });

  describe('answerValidation on save', () => {
    it('returns the error message if answer is empty', () => {
      expect(answerValidation('', { body : { submit : false } })).to.equal(i18n.question.textareaField.errorOnSave.empty);
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

    it('returns the error message if answer is not an email', () => {
      expect(uploadDescriptionValidation('')).to.equal(i18n.additionalEvidence.evidenceUpload.error.emptyDescription);
    });
  });

  describe('loginEmailAddressValidation', () => {
    it('returns the error message if answer is empty', () => {
      expect(loginEmailAddressValidation('')).to.equal(i18n.login.emailAddress.error.empty);
    });

    it('returns the error message if answer is not an email', () => {
      expect(loginEmailAddressValidation('not.an.email')).to.equal(i18n.login.emailAddress.error.format);
    });

    it('returns false if answer is valid', () => {
      expect(loginEmailAddressValidation('test@example.com')).to.equal(false);
    });
  });

  describe('tribunalViewAcceptedValidation', () => {
    it('returns false if answer is yes', () => {
      expect(tribunalViewAcceptedValidation('yes')).to.be.false;
    });

    it('returns false if answer is no', () => {
      expect(tribunalViewAcceptedValidation('no')).to.be.false;
    });

    it('returns empty error message is answer is anything else', () => {
      expect(tribunalViewAcceptedValidation('not valid')).to.equal(i18n.tribunalView.error.emptyOnDecisionPick);
    });

    it('returns empty error message is answer is missing', () => {
      expect(tribunalViewAcceptedValidation(undefined)).to.equal(i18n.tribunalView.error.emptyOnDecisionPick);
    });

    it('returns empty error message is confirmation is anything else', () => {
      expect(tribunalViewAcceptedValidation('not valid', true)).to.equal(i18n.tribunalView.error.emptyOnConfirm);
    });

    it('returns empty error message is confirmation is missing', () => {
      expect(tribunalViewAcceptedValidation(undefined, true)).to.equal(i18n.tribunalView.error.emptyOnConfirm);
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
      expect(newHearingAcceptedValidation('not valid')).to.equal(i18n.hearingConfirm.error.text);
    });

    it('returns empty error message is answer is missing', () => {
      expect(newHearingAcceptedValidation(undefined)).to.equal(i18n.hearingConfirm.error.text);
    });
  });
});

export {};
