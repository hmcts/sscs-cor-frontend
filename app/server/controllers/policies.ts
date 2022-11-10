import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import { Feature, isFeatureEnabled } from '../utils/featureEnabled';

function getCookiePrivacy(req: Request, res: Response) {
  if (isFeatureEnabled(Feature.ALLOW_COOKIE_BANNER_ENABLED, req.cookies)) {
    res.render('policy-pages/cookie-privacy-new.njk');
  } else {
    res.render('policy-pages/cookie-privacy-old.njk');
  }
}

function setupCookiePrivacyController(): Router {
  const router = Router();
  router.get(Paths.cookiePrivacy, getCookiePrivacy);
  router.get(Paths.cookiePrivacy2, getCookiePrivacy);
  return router;
}

export { setupCookiePrivacyController, getCookiePrivacy };
