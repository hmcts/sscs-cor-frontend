const content = require('../../../../app/common/locale/content.json');

function uploadEvidence() {
  const I = this;

  I.amOnPage('/additional-evidence');
  I.see(
    content.en.common.provideInformationOnline,
    "[for='additional-evidence-option']"
  );
  I.click('#additional-evidence-option');
  I.click('[name="continue"]');
  I.wait(3);
  I.fillField('#question-field', 'this is a test');
  I.click('#submit-statement');
}

function uploadWelshEvidence() {
  const I = this;

  I.amOnPage('/additional-evidence');
  I.see(
    content.cy.common.provideInformationOnline,
    "[for='additional-evidence-option']"
  );
  I.click('#additional-evidence-option');
  I.click('Parhau');
  I.wait(3);
  I.fillField('#question-field', 'this is a welsh test');
  I.click('#submit-statement');
}

module.exports = { uploadEvidence, uploadWelshEvidence };
