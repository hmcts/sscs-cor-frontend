import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';
import * as AppInsights from '../app-insights';
import { Dependencies } from '../routes';
import { logger } from '@hmcts/nodejs-logging';

function getYourDetails(req: Request, res: Response) {
  const session = req.session;
  console.log(session.case);
  if (!session) {
    const missingCaseIdError = new Error(
      'Unable to retrieve session from session store'
    );
    AppInsights.trackException(missingCaseIdError);
    AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
  }

  return res.render('your-details.njk', { details: session.case });
}

function setupYourDetailsController(deps: Dependencies) {
  const router = Router();
  router.get(Paths.yourDetails, deps.prereqMiddleware, getYourDetails);
  return router;
}

export { getYourDetails, setupYourDetailsController };
