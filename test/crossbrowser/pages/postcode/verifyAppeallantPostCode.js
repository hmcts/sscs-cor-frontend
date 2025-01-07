function verifyAppeallantPostCode() {
  const I = this;
  I.wait(5);
  I.click('[for=\'appeal-type-otherBenefits\']')
  I.wait(1);
  I.fillField('#postcode', 'TN32 6PL');
  I.click('#assign-case');
}

function verifyWelshAppellantPostCode() {
  const I = this;

  I.wait(5);
  I.click('.govuk-link.language');
  I.wait(5);
  I.click('[for=\'appeal-type-otherBenefits\']')
  I.wait(1);
  I.fillField('#postcode', 'TN32 6PL');
  I.click('#assign-case');
}

module.exports = { verifyAppeallantPostCode, verifyWelshAppellantPostCode };
