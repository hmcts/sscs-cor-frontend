import { Logger } from '@hmcts/nodejs-logging';
import { Request, Response, Router } from 'express';
import { HearingService } from '../services/hearing';
import * as Paths from '../paths';
import * as rp from 'request-promise';
import { OK } from 'http-status-codes';
import { TrackYourApealService } from '../services/tyaService';
import * as AppInsights from '../app-insights';

const content = require('../../../locale/content');
const postcodeRegex = /^((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])|([Gg][Ii][Rr]))))\s?([0-9][A-Za-z]{2})|(0[Aa]{2}))$/;

const logger = Logger.getLogger('login.js');

function getIndex(req: Request, res: Response) {
  return res.render('assign-case/index.html', {});
}

function postIndex(hearingService: HearingService, trackYourAppealService: TrackYourApealService) {
  return async (req: Request, res: Response) => {
    if (!req.body.postcode || !req.body.postcode.trim()) {
      return res.render('assign-case/index.html', {
        error: content.en.assignCase.errors.noPostcode
      });
    } else {
      if (!req.body.postcode.replace(/ /g,'').match(postcodeRegex)) {
        return res.render('assign-case/index.html', {
          error: content.en.assignCase.errors.invalidPostcode
        });
      }
    }
    AppInsights.trackTrace(`assign-case: Finding case to assign for tya [${req.session.tya}] email [${req.session.idamEmail}] postcode [${req.body.postcode}]`);
    const { statusCode, body }: rp.Response = await hearingService.assignOnlineHearingsToCitizen(
      req.session.idamEmail, req.session.tya, req.body.postcode, req
    );

    if (statusCode !== OK) {
      return res.render('assign-case/index.html', {
        error: content.en.assignCase.errors.postcodeDoesNotMatch
      });
    }

    req.session.hearing = body;

    logger.info(`Assigned ${req.session.tya} to ${req.session.idamEmail}`);

    const { appeal } = await trackYourAppealService.getAppeal(req.session.hearing.case_id, req);

    req.session.appeal = appeal;

    if (req.session.appeal.hearingType === 'cor') {
      return res.redirect(Paths.taskList);
    } else {
      req.session.hearing.case_reference = req.session.hearing.case_id ? req.session.hearing.case_id.toString() : '';
      return res.redirect(Paths.status);
    }
  };
}

function setupAssignCaseController(deps) {
  const router = Router();
  router.get(Paths.assignCase, getIndex);
  router.post(Paths.assignCase, postIndex(deps.hearingService, deps.trackYourApealService));

  return router;
}

export {
  setupAssignCaseController,
  getIndex,
  postIndex
};
