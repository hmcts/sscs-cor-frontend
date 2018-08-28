const { expect } = require('test/chai-sinon');
const { answerValidation, loginEmailAddressValidation } = require('app/utils/fieldValidation');
const i18n = require('app/locale/en');

describe('utils/fieldValidation.js', () => {
  describe('answerValidation', () => {
    it('returns the error message if answer is empty', () => {
      expect(answerValidation('')).to.equal(i18n.question.textareaField.error.empty);
    });

    it('returns false if answer is valid', () => {
      expect(answerValidation('Valid answer')).to.equal(false);
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
});
