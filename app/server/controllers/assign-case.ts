import { Logger } from '@hmcts/nodejs-logging';
import { Request, Response, Router } from 'express';
import { HearingService } from '../services/hearing';
import * as Paths from '../paths';
import * as rp from 'request-promise';
import { OK } from 'http-status-codes';
import { TrackYourApealService } from '../services/tyaService';

const logger = Logger.getLogger('login.js');

function getIndex(req: Request, res: Response) {
  if (req.query.error) {
    return res.render('assign-case/index.html', { error: req.query.error });
  }
  return res.render('assign-case/index.html', {});
}

function postIndex(hearingService: HearingService, trackYourAppealService: TrackYourApealService) {
  return async (req: Request, res: Response) => {
    const { statusCode, body }: rp.Response = await hearingService.assignOnlineHearingsToCitizen(
      req.session.idamEmail, req.session.tya, req.body.postcode, req
    );

    if (statusCode !== OK) {
      return res.redirect(Paths.assignCase + '?error=true');
    }

    req.session.hearing = body;

    logger.info(`Assigned ${req.session.tya} to ${req.session.idamEmail}`);

    const { appeal } = await trackYourAppealService.getAppeal(req.session.hearing.case_id, req);

    req.session.appeal = appeal;

    return res.redirect(Paths.status);
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
