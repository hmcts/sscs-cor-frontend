import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';

function getYourDetails(req: Request, res: Response) {
  if (!isFeatureEnabled(Feature.MANAGE_YOUR_APPEAL, req.cookies)) {
    return res.render('errors/404.html', {
      ft_welsh: req.session.featureToggles.ft_welsh
    });
  }

  return res.render('your-details.html', {
    details: req.session.hearing,
    subscriptions: req.session.subscriptions,
    contact: req.session.appeal.contact,
    ft_welsh: req.session.featureToggles.ft_welsh
  });
}

function setupYourDetailsController(deps: any) {
  const router = Router();
  router.get(Paths.yourDetails, deps.prereqMiddleware, getYourDetails);
  return router;
}

export {
  getYourDetails,
  setupYourDetailsController
};
