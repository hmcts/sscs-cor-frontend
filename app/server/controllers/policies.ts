import { Router, Request, Response } from 'express';
import * as Paths from '../paths';

function getCookiePrivacy(req: Request, res: Response) {
  res.render('policy-pages/cookie-privacy-old.html');
}

function getNewCookiePrivacy(req: Request, res: Response) {
  res.render('policy-pages/cookie-privacy-new.html');
}

function setupCookiePrivacyController(): Router {
  const router = Router();
  router.get(Paths.cookiePrivacy, getCookiePrivacy);
  router.get(Paths.cookiePrivacy2, getNewCookiePrivacy);
  return router;
}

export {
    setupCookiePrivacyController,
    getCookiePrivacy,
    getNewCookiePrivacy
};
