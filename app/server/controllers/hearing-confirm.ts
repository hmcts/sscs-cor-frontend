import { Router, Request, Response, NextFunction } from 'express';
import * as Paths from '../paths';
import { newHearingAcceptedValidation } from '../utils/fieldValidation';
import { CONST } from '../../constants';

function getIndex(req: Request, res: Response) {
  const decisionViewExists: boolean = req.session.hearing.decision.decision_state === CONST.TRIBUNAL_VIEW_ISSUED_STATE;
  if (!decisionViewExists) {
    return res.redirect(Paths.logout);
  }
  const appellantRejected: boolean = req.session.hearing.decision && req.session.hearing.decision.appellant_reply === 'decision_rejected';
  if (appellantRejected) {
    return res.redirect(Paths.hearingWhy);
  }
  return res.render('hearing-confirm/index.html', {
    ft_welsh: req.session.featureToggles.ft_welsh
  });
}

function postIndex(req: Request, res: Response) {
  const newHearing: string = req.body['new-hearing'];
  const validationMessage = newHearingAcceptedValidation(newHearing);

  if (validationMessage) {
    return res.render('hearing-confirm/index.html', {
      error: validationMessage,
      ft_welsh: req.session.featureToggles.ft_welsh
    });
  }

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
