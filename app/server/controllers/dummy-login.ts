import * as Paths from '../paths';
import { Router, Response, Request, NextFunction } from 'express';
import * as AppInsights from '../app-insights';

function getLogin(req: Request, res: Response) {
  return res.render('dummy-login.html');
}

function postLogin(loadHearingAndEnterService, getOnlineHearing) {
  return async(req: Request, res: Response, next: NextFunction) => {
    const email: string = req.body['username'];

    try {
      return loadHearingAndEnterService(getOnlineHearing, email, req, res);
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

function setupDummyLoginController(deps) {
  const router = Router();
  router.get(Paths.dummyLogin, getLogin);
  router.post(Paths.dummyLogin, postLogin(deps.loadHearingAndEnterService, deps.getOnlineHearing));

  return router;
}

export {
  setupDummyLoginController,
  getLogin,
  postLogin
};