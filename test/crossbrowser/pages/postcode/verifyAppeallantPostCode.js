function verifyAppeallantPostCode() {
  const I = this;
  I.fillField('#postcode', 'TN32 6PL');
  I.click('#assign-case');
}

function verifyWelshAppellantPostCode() {
  const I = this;

  I.click('.govuk-link.language');
  I.fillField('#postcode', 'TN32 6PL');
  I.click('#assign-case');
}

module.exports = { verifyAppeallantPostCode, verifyWelshAppellantPostCode };