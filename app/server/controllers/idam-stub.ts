import { Router, Request, Response } from 'express';
import { NO_CONTENT } from 'http-status-codes';
const config = require('config');
const cache = require('memory-cache');

const enableStub = config.get('idam.enableStub') === 'true';

function generateRandomNumber() {
  return Math.floor(Math.random() * 100000);
}

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
  const code = generateRandomNumber();
  cache.put(`idamStub.code.${code}`, req.body.username);
  res.redirect(`${req.body.redirect_uri}?code=${code}&username=${req.body.username}`);
}

function getToken(req: Request, res: Response) {
  const code = req.body.code;
  const username = cache.get(`idamStub.code.${code}`);
  const token = generateRandomNumber();
  cache.put(`idamStub.token.${token}`, username);
  res.json({ access_token: token });
}

function getDetails(req: Request, res: Response) {
  const token = req.headers.authorization.replace('Bearer ', '');
  const username = cache.get(`idamStub.token.${token}`);
  res.json({ email: username });
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
