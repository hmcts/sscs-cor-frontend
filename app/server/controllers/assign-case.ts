import { Logger } from '@hmcts/nodejs-logging';
import { Request, Response, Router } from 'express';
import { HearingService } from '../services/hearing';
import * as Paths from '../paths';
import * as rp from 'request-promise';
import { OK } from 'http-status-codes';
import { TrackYourApealService } from '../services/tyaService';
import * as AppInsights from '../app-insights';

const i18next = require('i18next');
const content = require('../../../locale/content');

const postcodeRegex = /^([A-Z][A-HJ-Y]?\d[A-Z\d]?\s?\d[A-Z]{2}|GIR ?0A{2})$/gi;

const logger = Logger.getLogger('login.js');

function getIndex(req: Request, res: Response) {
  return res.render('assign-case/index.njk', {});
}

function postIndex(
  hearingService: HearingService,
  trackYourAppealService: TrackYourApealService
) {
  return async (req: Request, res: Response) => {
    const postcode = req.body.postcode;
    const tya = req.session['tya'];
    const email = req.session['idamEmail'];
    if (!postcode || !postcode.trim()) {
      logger.error(
        `No postcode for postcode: ${postcode}, TYA: ${tya} and email:${email}`
      );
      return res.render('assign-case/index.njk', {
        error: content[i18next.language].assignCase.errors.noPostcode,
      });
    } else if (!postcode.replace(/\s/g, '').match(postcodeRegex)) {
      logger.error(
        `Invalid for postcode: ${postcode}, TYA: ${tya} and email:${email}`
      );
      return res.render('assign-case/index.njk', {
        error: content[i18next.language].assignCase.errors.invalidPostcode,
      });
    }
    if (!tya) {
      logger.error(
        `tyaNotProvided postcode: ${req?.body?.postcode}, TYA: ${tya} and email:${email}`
      );
      return res.render('assign-case/index.njk', {
        error: content[i18next.language].assignCase.errors.tyaNotProvided,
      });
    }
    AppInsights.trackTrace(
      `assign-case: Finding case to assign for tya [${tya}] email [${email}] postcode [${postcode}]`
    );
    const { statusCode, body }: rp.Response =
      await hearingService.assignOnlineHearingsToCitizen(
        email,
        tya,
        postcode,
        req
      );

    if (statusCode !== OK) {
      logger.error(
        `Not matching record for: ${postcode}, TYA: ${tya} and email:${email}. StatusCode ${statusCode}, error:`,
        body
      );
      AppInsights.trackTrace(
        `assign-case: Failed finding case to assign for tya [${tya}] email [${email}] postcode [${postcode}]`
      );
      return res.render('assign-case/index.njk', {
        error: content[i18next.language].assignCase.errors.postcodeDoesNotMatch,
      });
    }

    req.session['hearing'] = body;

    logger.info(`Assigned ${tya} to ${email}`);

    const { appeal } = await trackYourAppealService.getAppeal(
      req.session['hearing'].case_id,
      req
    );

    req.session['appeal'] = appeal;
    req.session['hideHearing'] =
      // eslint-disable-next-line no-eq-null,eqeqeq
      appeal.hideHearing == null ? false : appeal.hideHearing;
    req.session['hearing'].case_reference = req.session['hearing'].case_id
      ? req.session['hearing'].case_id.toString()
      : '';
    return res.redirect(Paths.status);
  };
}

function setupAssignCaseController(deps) {
  const router = Router();
  router.get(Paths.assignCase, deps.prereqMiddleware, getIndex);
  router.post(
    Paths.assignCase,
    deps.prereqMiddleware,
    postIndex(deps.hearingService, deps.trackYourApealService)
  );

  return router;
}

export { setupAssignCaseController, getIndex, postIndex };
