const content = require('locale/content');

function verifyStatusHeader() {
  const I = this;

  I.see(content.en.common.yourBenefitAppeal, '.govuk-heading-xl');
  I.seeElement('.navigation-tabs');
  I.see(content.en.statusTab.tabHeader, '.navigation-tabs ul li.selected');
  I.see(content.en.statusTab.header, '.task-list h2');
  I.see(content.en.statusTab.panelHeader, '.panel');
  I.see(content.en.helpGuides.header, '.mya-contact__content h2');
  I.see(content.en.helpGuides.representatives.linkHeader, '.mya-contact__content .govuk-list');
  I.see(content.en.contactUs.title, '.govuk-details.contact-us');
}

function verifyWelshStatusHeader() {
  const I = this;

  I.see('Eich apêl am fudd-dal PIP', '.govuk-heading-xl');
  I.seeElement('.navigation-tabs');
  I.see('Statws', '.navigation-tabs ul li.selected');
  I.see('Statws eich apêl', '.task-list h2');
  I.see('Diweddariad diweddaraf', '.panel');
  I.see('Cysylltwch â ni i gael cymorth', '.govuk-details.contact-us span');
}

module.exports = { verifyStatusHeader, verifyWelshStatusHeader };