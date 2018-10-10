const { expect } = require('test/chai-sinon');
import { CONST } from 'app/constants';
import { Page } from 'puppeteer';
import { startServices } from 'test/browser/common';
import { TribunalViewPage } from 'test/page-objects/tribunal-view';
import { HearingConfirmPage } from 'test/page-objects/hearing-confirm';
import * as moment from 'moment';

const i18n = require('locale/en');

describe('Request a hearing', () => {
  let page: Page;
  let tribunalViewPage: TribunalViewPage;
  let hearingConfirmPage: HearingConfirmPage;

  before('start services and bootstrap data in CCD/COH', async() => {
    const res = await startServices({ bootstrapData: true, performLogin: true, issueDecision: true });
    page = res.page;
    tribunalViewPage = new TribunalViewPage(page);
    hearingConfirmPage = new HearingConfirmPage(page);
    await tribunalViewPage.screenshot('tribunal-view-issued');
  });

  after(async() => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('is on the /tribunal-view path', async() => {
    tribunalViewPage.verifyPage();
  });

  describe('requesting a hearing', () => {
    it('shows the hearing confirm page if request hearing is selected', async() => {
      await tribunalViewPage.visitPage();
      await tribunalViewPage.requestHearing();
      await tribunalViewPage.submit();
      hearingConfirmPage.verifyPage();
      await hearingConfirmPage.screenshot('hearing-confirm');
    });

    it('validates that one option must be selected', async() => {
      await hearingConfirmPage.submit();
      await hearingConfirmPage.screenshot('hearing-confirm-validation');
      expect(await hearingConfirmPage.getElementText('#error-summary-title')).contain(i18n.hearingConfirm.error.title);
      expect(await hearingConfirmPage.getElementText('.govuk-error-summary__body')).contain(i18n.hearingConfirm.error.text);
      expect(await hearingConfirmPage.getElementText('#new-hearing-error')).contain(i18n.hearingConfirm.error.text);
    });

    it('redirects to tribunal view if no is selected', async() => {
      await hearingConfirmPage.clickNo();
      await hearingConfirmPage.submit();
      tribunalViewPage.verifyPage();
    });
  });
});
