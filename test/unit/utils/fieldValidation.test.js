const { expect } = require('test/chai-sinon');
const { answerValidation } = require('app/utils/fieldValidation');
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
});
