import { Router, Request, Response, NextFunction } from 'express';
import * as Paths from '../paths';
import { newHearingAcceptedValidation } from '../utils/fieldValidation';

function getIndex(req: Request, res: Response) {
  if (req.session.newHearingConfirmationThisSession) {
    return res.render('hearing-confirm/index.html', {});
  }
  return res.redirect(Paths.logout);
}

function postIndex(req: Request, res: Response) {

  const newHearing: string = req.body['new-hearing'];

  const validationMessage = newHearingAcceptedValidation(newHearing);

  if (validationMessage) return res.render('hearing-confirm/index.html', { error: validationMessage });
  
  if (newHearing === 'no') return res.redirect(Paths.tribunalView);
  
  res.redirect(Paths.hearingWhy);
}

function setupHearingConfirmController(deps: any) {
  // eslint-disable-next-line new-cap
  const router = Router();
  router.get(Paths.hearingConfirm, deps.prereqMiddleware, getIndex);
  router.post(Paths.hearingConfirm, deps.prereqMiddleware, postIndex);
  return router;
}

export {
  getIndex,
  postIndex,
  setupHearingConfirmController
};