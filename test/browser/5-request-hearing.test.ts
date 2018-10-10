const { expect } = require('test/chai-sinon');
import { CONST } from 'app/constants';
import { Page } from 'puppeteer';
import { startServices } from 'test/browser/common';
import { TribunalViewPage } from 'test/page-objects/tribunal-view';
import { HearingConfirmPage } from 'test/page-objects/hearing-confirm';
import { HearingWhyPage } from 'test/page-objects/hearing-why';
const mockDataHearing = require('test/mock/cor-backend/services/hearing').template;
import * as moment from 'moment';
const i18n = require('locale/en');

const testUrl = require('config').get('testUrl')
const testingLocalhost = testUrl.indexOf('localhost') !== -1

describe('Request a hearing', () => {
  if (testingLocalhost) {
    let page: Page;
    let tribunalViewPage: TribunalViewPage;
    let hearingConfirmPage: HearingConfirmPage;
    let hearingWhyPage: HearingWhyPage;
    let caseReference: string;

    before('start services and bootstrap data in CCD/COH', async () => {
      const res = await startServices({ bootstrapData: true, performLogin: true, issueDecision: true });
      page = res.page;
      tribunalViewPage = new TribunalViewPage(page);
      hearingConfirmPage = new HearingConfirmPage(page);
      hearingWhyPage = new HearingWhyPage(page);
      caseReference = res.ccdCase.caseReference || mockDataHearing.case_reference;
    });

    after(async () => {
      if (page && page.close) {
        await page.close();
      }
    });

    it('is on the /tribunal-view path', async () => {
      tribunalViewPage.verifyPage();
    });

    describe('requesting a hearing page', () => {
      it('shows the hearing confirm page if request hearing is selected', async () => {
        await tribunalViewPage.visitPage();
        await tribunalViewPage.requestHearing();
        await tribunalViewPage.submit();
        hearingConfirmPage.verifyPage();
        await hearingConfirmPage.screenshot('hearing-confirm');
      });

      it('validates that one option must be selected', async () => {
        await hearingConfirmPage.submit();
        await hearingConfirmPage.screenshot('hearing-confirm-validation');
        expect(await hearingConfirmPage.getElementText('#error-summary-title')).contain(i18n.hearingConfirm.error.title);
        expect(await hearingConfirmPage.getElementText('.govuk-error-summary__body')).contain(i18n.hearingConfirm.error.text);
        expect(await hearingConfirmPage.getElementText('#new-hearing-error')).contain(i18n.hearingConfirm.error.text);
      });

      describe('appalent chooses not to request a hearing', () => {
        it('redirects to tribunal view if no is selected', async () => {
          await hearingConfirmPage.clickNo();
          await hearingConfirmPage.submit();
          tribunalViewPage.verifyPage();
        });
      });

      describe('appalent chooses request a hearing', () => {
        it('shows the explain reason why page', async () => {
          await hearingConfirmPage.visitPage();
          await hearingConfirmPage.clickYes();
          await hearingConfirmPage.submit();
          hearingWhyPage.verifyPage();
          await hearingWhyPage.screenshot('hearing-why-page');
        });

        it('validates that a reason must be given', async () => {
          await hearingWhyPage.giveReasonWhy('');
          await hearingWhyPage.submit();
          expect(await hearingConfirmPage.getElementText('#error-summary-title')).contain(i18n.hearingWhy.error.summaryHeading);
          expect(await hearingConfirmPage.getElementText('.govuk-error-summary__body')).contain(i18n.hearingWhy.error.empty);
          await hearingWhyPage.screenshot('hearing-why-validaiton');
        });

        it('submits the reason and shows the hearing booking details', async () => {
          await hearingWhyPage.giveReasonWhy('The reason why I want a hearing');
          await hearingWhyPage.submit();
          expect(await hearingWhyPage.getElementText('h1')).contain(i18n.hearingWhy.booking.header);
          const responseDate = await tribunalViewPage.getElementText('#responseDate');
          expect(responseDate).to.contain(`${moment().utc().add(6, 'week').format(CONST.DATE_FORMAT)}`);
          const caseReference = await tribunalViewPage.getElementText('#caseReference');
          expect(caseReference).to.contain(`${caseReference}`);
          await hearingWhyPage.screenshot('hearing-why-booking-details');
        });
      });
    });
  }
});
