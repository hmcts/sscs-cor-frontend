import {
  answerValidation,
  loginEmailAddressValidation,
  newHearingAcceptedValidation,
  hearingWhyValidation,
  uploadDescriptionValidation,
} from 'app/server/utils/fieldValidation';

const { expect } = require('test/chai-sinon');
const content = require('locale/content');

describe('utils/fieldValidation.js', function () {
  describe('answerValidation on submit', function () {
    it('returns the error message if answer is empty', function () {
      expect(answerValidation('', { body: { submit: true } })).to.equal(
        content.en.question.textareaField.error.empty
      );
    });

    it('returns the error message if answer does not meet permitted characters', function () {
      expect(answerValidation('$', { body: { submit: true } })).to.equal(
        content.en.question.textareaField.error.regex
      );
    });

    it('returns the error message if answer contains script characters', function () {
      expect(
        answerValidation(
          'hello <script>alert("This is an XSS alert")</script>',
          { body: { submit: true } }
        )
      ).to.equal(content.en.question.textareaField.error.regex);
    });

    it('returns false if answer is valid', function () {
      expect(
        answerValidation('Valid answer', { body: { submit: true } })
      ).to.equal(false);
    });
  });

  describe('answerValidation on save', function () {
    it('returns the error message if answer is empty', function () {
      expect(answerValidation('', { body: { submit: false } })).to.equal(
        content.en.question.textareaField.errorOnSave.empty
      );
    });

    it('returns false if answer is valid', function () {
      expect(
        answerValidation('Valid answer', { body: { submit: false } })
      ).to.equal(false);
    });
  });

  describe('hearingWhyValidation', function () {
    it('returns false if answer is valid', function () {
      expect(hearingWhyValidation('Valid answer')).to.equal(false);
    });
  });

  describe('uploadDescriptionValidation', function () {
    it('returns false if answer is valid', function () {
      expect(uploadDescriptionValidation('Valid answer')).to.equal(false);
    });

    it('returns the error message if description is empty', function () {
      expect(uploadDescriptionValidation('')).to.equal(
        content.en.additionalEvidence.evidenceUpload.error.emptyDescription
      );
    });

    it('returns the error message if description has script chars', function () {
      expect(
        uploadDescriptionValidation(
          '<<sc<<script>script>alert("This is an XSS alert")<</scr<</script>/script>'
        )
      ).to.equal(content.en.additionalEvidence.evidenceUpload.error.regex);
    });

    it('returns the error message if description has invalid chars', function () {
      expect(uploadDescriptionValidation('$ ^ @ { }')).to.equal(
        content.en.additionalEvidence.evidenceUpload.error.regex
      );
    });
  });

  describe('loginEmailAddressValidation', function () {
    it('returns the error message if answer is empty', function () {
      expect(loginEmailAddressValidation('')).to.equal(
        content.en.login.emailAddress.error.empty
      );
    });

    it('returns the error message if answer is not an email', function () {
      expect(loginEmailAddressValidation('not.an.email')).to.equal(
        content.en.login.emailAddress.error.format
      );
    });

    it('returns false if answer is valid', function () {
      expect(loginEmailAddressValidation('test@example.com')).to.equal(false);
    });
  });

  describe('newHearingAcceptedValidation', function () {
    it('returns false if answer is yes', function () {
      expect(newHearingAcceptedValidation('yes')).to.be.false;
    });

    it('returns false if answer is no', function () {
      expect(newHearingAcceptedValidation('no')).to.be.false;
    });

    it('returns empty error message is answer is anything else', function () {
      expect(newHearingAcceptedValidation('not valid')).to.equal(
        content.en.hearingConfirm.error.text
      );
    });

    it('returns empty error message is answer is missing', function () {
      expect(newHearingAcceptedValidation(undefined)).to.equal(
        content.en.hearingConfirm.error.text
      );
    });
  });
});
