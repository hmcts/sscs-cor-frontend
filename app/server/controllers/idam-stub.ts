import { Router, Request, Response } from 'express';
import { NO_CONTENT } from 'http-status-codes';
const config = require('config');

const enableStub = config.get('idam.enableStub') === 'true';

function getLogin(req: Request, res: Response) {
  res.append('Content-Type', 'text/html');
  // use the redirect url in request for the final redirect
  const redirectUri = req.query.redirect_uri;
  res.send(`<html><head></head><body>
      <form action="/idam-stub/login" method="post">
      Username: <input type="text" id="username" name="username"/><br />
      Password: <input type="text" id="password" name="password"/><br />
      <input type="text" name="redirect_uri" value="${redirectUri}"/>
      <input type="submit" name="save" value="login"/>
      </form>
      </body></html>`);
}

function postLogin(req: Request, res: Response) {
  res.redirect(`${req.body.redirect_uri}?code=123&username=${req.body.username}`);
}

function getToken(req: Request, res: Response) {
  res.json({ access_token: '09876' });
}

function getDetails(req: Request, res: Response) {
  res.json({ email: req.query.username });
}

function deleteToken(req: Request, res: Response) {
  res.status(NO_CONTENT).send();

}

function setupIdamStubController(): Router {
  const router: Router = Router();
  if (enableStub) {
    router.get('/idam-stub/login', getLogin);
    router.post('/idam-stub/login', postLogin);
    router.post('/idam-stub/oauth2/token', getToken);
    router.get('/idam-stub/details', getDetails);
    router.delete('/idam-stub/session/:token', deleteToken);
  }
  return router;
}

export {
  setupIdamStubController
};
