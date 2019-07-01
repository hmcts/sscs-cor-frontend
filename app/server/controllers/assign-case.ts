import { Logger } from '@hmcts/nodejs-logging';
import { Request, Response, Router } from 'express';
import { HearingService } from '../services/hearing';
import * as Paths from '../paths';
import * as rp from 'request-promise';
import { OK } from 'http-status-codes';

const logger = Logger.getLogger('login.js');

function getIndex(req: Request, res: Response) {
  if (req.query.error) {
    return res.render('assign-case/index.html', { error: req.query.error });
  }
  return res.render('assign-case/index.html', {});
}

function postIndex(hearingService: HearingService) {
  return async (req: Request, res: Response) => {
    const { statusCode, body }: rp.Response = await hearingService.assignOnlineHearingsToCitizen(
      req.session.idamEmail, req.session.tya, req.body.postcode, req
    );

    if (statusCode !== OK) {
      return res.redirect(Paths.assignCase + '?error=true');
    }

    req.session.hearing = body;

    logger.info(`Assigned ${req.session.tya} to ${req.session.idamEmail}`);
    return res.redirect(Paths.taskList);
  };
}

function setupAssignCaseController(deps) {
  const router = Router();
  router.get(Paths.assignCase, getIndex);
  router.post(Paths.assignCase, postIndex(deps.hearingService));

  return router;
}

export {
  setupAssignCaseController,
  getIndex,
  postIndex
};
