import { Router, Request, Response, NextFunction } from 'express';
import * as Paths from '../paths';
import { hearingWhyValidation } from '../utils/fieldValidation';

function getIndex(req: Request, res: Response) {
  if (req.session.newHearingConfirmationThisSession) {
    return res.render('hearing-why/index.html', { });
  }
  return res.redirect(Paths.logout);
}


function postIndex(req: Request, res: Response) {

  const explainWhy: string = req.body['explain-why'];
  const validationMessage = hearingWhyValidation(explainWhy);

  if (validationMessage) return res.render('hearing-why/index.html', { error: validationMessage });

  //  TODO - submit to API
  return res.redirect(Paths.hearingBooking);

}

function setupHearingWhyController(deps: any) {
  // eslint-disable-next-line new-cap
  const router = Router();
  router.get(Paths.hearingWhy, deps.prereqMiddleware, getIndex);
  router.post(Paths.hearingWhy, deps.prereqMiddleware, postIndex);
  return router;
}

export {
  getIndex,
  postIndex,
  setupHearingWhyController
};