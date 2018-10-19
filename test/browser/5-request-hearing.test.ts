const { expect } = require('test/chai-sinon');
import { CONST } from 'app/constants';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Page } from 'puppeteer';
import { startServices, login } from 'test/browser/common';
import { TribunalViewPage } from 'test/page-objects/tribunal-view';
import { HearingConfirmPage } from 'test/page-objects/hearing-confirm';
import { HearingWhyPage } from 'test/page-objects/hearing-why';
const mockDataHearing = require('test/mock/cor-backend/services/hearing').template;
const i18n = require('locale/en');
const config = require('config');

const testUrl = config.get('testUrl');

const pa11y = require('pa11y');
let pa11yOpts = _.clone(config.get('pa11y'));

describe('Request a hearing', () => {
  let page: Page;
  let tribunalViewPage: TribunalViewPage;
  let hearingConfirmPage: HearingConfirmPage;
  let hearingWhyPage: HearingWhyPage;
  let caseReference: string;

  before('start services and bootstrap data in CCD/COH', async () => {
    const res = await startServices({ bootstrapData: true, performLogin: true, issueDecision: true });
    page = res.page;
    pa11yOpts.browser = res.browser;
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

    before('request the hearing', async () => {
      await tribunalViewPage.visitPage();
      await tribunalViewPage.requestHearing();
      await tribunalViewPage.submit();
    });

    it('shows the hearing confirm page if request hearing is selected', async () => {
      hearingConfirmPage.verifyPage();
      await hearingConfirmPage.screenshot('hearing-confirm');
    });

    /* PA11Y */
    it('checks /hearing-confirm path passes @pa11y', async () => {
      const result = await pa11y(`${testUrl}${hearingConfirmPage.pagePath}`, pa11yOpts);
      expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
    });

    it('validates that one option must be selected', async () => {
      await hearingConfirmPage.submit();
      await hearingConfirmPage.screenshot('hearing-confirm-validation');
      expect(await hearingConfirmPage.getElementText('#error-summary-title')).contain(i18n.errorSummary.titleText);
      expect(await hearingConfirmPage.getElementText('.govuk-error-summary__body')).contain(i18n.hearingConfirm.error.text);
      expect(await hearingConfirmPage.getElementText('#new-hearing-error')).contain(i18n.hearingConfirm.error.text);
    });

    describe('appellant chooses not to request a hearing', () => {
      it('redirects to tribunal view if no is selected', async () => {
        await hearingConfirmPage.clickNo();
        await hearingConfirmPage.submit();
        tribunalViewPage.verifyPage();
      });
    });

    describe('appellant chooses request a hearing', () => {
      before('select yes to hearing', async () => {
        await hearingConfirmPage.visitPage();
        await hearingConfirmPage.clickYes();
        await hearingConfirmPage.submit();
      });

      it('shows the explain reason why page', async () => {
        await hearingWhyPage.screenshot('hearing-why-page');
        hearingWhyPage.verifyPage();
      });

      /* PA11Y */
      it('checks /hearing-why path passes @pa11y', async () => {
        const result = await pa11y(`${testUrl}${hearingWhyPage.pagePath}`, pa11yOpts);
        expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
      });

      it('validates that a reason must be given', async () => {
        await hearingWhyPage.giveReasonWhy('');
        await hearingWhyPage.submit();
        expect(await hearingConfirmPage.getElementText('#error-summary-title')).contain(i18n.errorSummary.titleText);
        expect(await hearingConfirmPage.getElementText('.govuk-error-summary__body')).contain(i18n.hearingWhy.error.empty);
        await hearingWhyPage.screenshot('hearing-why-validaiton');
      });

      it('submits the reason and shows the hearing booking details', async () => {
        await hearingWhyPage.giveReasonWhy('The reason why I want a hearing');
        await hearingWhyPage.submit();
        await hearingWhyPage.screenshot('hearing-why-booking-details');
        expect(await hearingWhyPage.getHeading()).equal(i18n.hearingWhy.booking.header);
        const responseDate = await tribunalViewPage.getElementText('#responseDate');
        expect(responseDate).to.contain(`${moment.utc().add(6, 'week').format(CONST.DATE_FORMAT)}`);
        const caseReference = await tribunalViewPage.getElementText('#caseReference');
        expect(caseReference).to.contain(`${caseReference}`);
      });

      it('returns the user to the hearing booking page if they sign-in later', async () => {
        await login(page);
        hearingWhyPage.verifyPage();
        expect(await hearingWhyPage.getHeading()).to.equal(i18n.hearingWhy.booking.header);
      });
    });
  });
});
