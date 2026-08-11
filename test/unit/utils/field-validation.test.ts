import {
  answerValidation,
  loginEmailAddressValidation,
  newHearingAcceptedValidation,
  hearingWhyValidation,
  uploadDescriptionValidation,
  getMaskedEmail,
} from 'app/server/utils/fieldValidation';

import { expect } from 'test/chai-sinon';
import content from 'app/common/locale/content.json';

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

  describe('getMaskedEmail', function () {
    it('returns the email as-is if email is empty', function () {
      expect(getMaskedEmail('')).to.equal('');
    });

    it('returns the email as-is if email is null or undefined', function () {
      expect(getMaskedEmail(null as any)).to.equal(null);
      expect(getMaskedEmail(undefined as any)).to.equal(undefined);
    });

    it('returns the email as-is if email has no @ symbol', function () {
      expect(getMaskedEmail('notanemail')).to.equal('notanemail');
    });

    it('masks email when @ index is greater than 3', function () {
      expect(getMaskedEmail('johnsmith@example.com')).to.equal('joh***@ex***');
    });

    it('masks email with short local part when @ index is 3 or less', function () {
      expect(getMaskedEmail('abc@example.com')).to.equal('abc***@ex***');
    });

    it('masks email with very short local part', function () {
      expect(getMaskedEmail('a@example.com')).to.equal('a***@ex***');
    });

    it('masks complex email addresses', function () {
      expect(
        getMaskedEmail('firstname.lastname@subdomain.example.com')
      ).to.equal('fir***@su***');
    });

    it('masks email with numbers in local part', function () {
      expect(getMaskedEmail('user123@example.com')).to.equal('use***@ex***');
    });
  });
});
