const { expect } = require('test/chai-sinon');
import { answerValidation, loginEmailAddressValidation, tribunalViewAcceptedValidation, newHearingAcceptedValidation, hearingWhyValidation } from 'app/server/utils/fieldValidation.ts';
const i18n = require('locale/en');

describe('utils/fieldValidation.js', () => {
  describe('answerValidation', () => {
    it('returns the error message if answer is empty', () => {
      expect(answerValidation('')).to.equal(i18n.question.textareaField.error.empty);
    });

    it('returns false if answer is valid', () => {
      expect(answerValidation('Valid answer')).to.equal(false);
    });
  });

  describe('hearingWhyValidation', () => {
    it('returns the error message if answer is empty', () => {
      expect(hearingWhyValidation('')).to.equal(i18n.hearingWhy.error.empty);
    });

    it('returns false if answer is valid', () => {
      expect(hearingWhyValidation('Valid answer')).to.equal(false);
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
      expect(tribunalViewAcceptedValidation('not valid')).to.equal(i18n.tribunalView.error.empty);
    });

    it('returns empty error message is answer is missing', () => {
      expect(tribunalViewAcceptedValidation(undefined)).to.equal(i18n.tribunalView.error.empty);
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