import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';
import * as AppInsights from '../app-insights';
import { Dependencies } from '../routes';

function getYourDetails(req: Request, res: Response) {
  const session = req.session;

  if (!session) {
    const missingCaseIdError = new Error(
      'Unable to retrieve session from session store'
    );
    AppInsights.trackException(missingCaseIdError);
    AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
  }

  return res.render('your-details.njk', {
    details: session.case,
    appeal: session.appeal,
  });
}

function setupYourDetailsController(deps: Dependencies) {
  const router = Router();
  router.get(Paths.yourDetails, deps.prereqMiddleware, getYourDetails);
  return router;
}

export { getYourDetails, setupYourDetailsController };
