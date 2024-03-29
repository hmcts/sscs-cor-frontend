import { Router, Request, Response } from 'express';
import { NO_CONTENT } from 'http-status-codes';
import multer, { diskStorage } from 'multer';
import { createRedisClient } from '../middleware/redis';
import config from 'config';
import { Logger } from '@hmcts/nodejs-logging';
import { LoggerInstance } from 'winston';
import Redis from 'ioredis';

const storageOptions = {};
const multipart = multer({
  storage: diskStorage(storageOptions),
  limits: {
    // Compliant: 8MB
    fileSize: 8000000,
  },
});

const logger: LoggerInstance = Logger.getLogger('idam-stub');

const enableStub = config.get('idam.enableStub') === 'true';

let redis: Redis = null;

function generateRandomNumber() {
  return Math.floor(Math.random() * 100000);
}

function getLogin(req: Request, res: Response) {
  res.append('Content-Type', 'text/html');
  // use the redirect url in request for the final redirect
  const { redirectUri, state } = req.query;
  res.render('login.njk', { redirectUri, state });
}

async function postLogin(req: Request, res: Response) {
  const code = generateRandomNumber();
  logger.info('postLogin generating code', code);
  await redis.set(`idamStub.code.${code}`, req.body.username, 'EX', 60);
  logger.info(
    'postLogin adding username to redis under code',
    req.body.username,
    await redis.get(`idamStub.code.${code}`)
  );
  const stateParam = req.body.state ? `&state=${req.body.state}` : '';
  res.redirect(`${req.body.redirectUri}?code=${code}${stateParam}`);
}

async function getToken(req: Request, res: Response) {
  const code = req.body.code;
  logger.info('getToken retrieve code from body', req.body.code, code);
  const username = await redis.get(`idamStub.code.${code}`);
  logger.info('getToken getting username from redis', username);
  const token = generateRandomNumber();
  logger.info('getToken generating token', token);
  await redis.set(`idamStub.token.${token}`, username, 'EX', 60);
  logger.info(
    'getToken adding username to redis under token',
    username,
    await redis.get(`idamStub.token.${token}`)
  );
  res.json({ access_token: token });
}

async function getDetails(req: Request, res: Response) {
  const token = req.headers.authorization.replace('Bearer ', '');
  logger.info(
    'getDetails retrieveing token from header',
    req.headers.authorization,
    token
  );
  const username = await redis.get(`idamStub.token.${token}`);
  logger.info('getDetails getting username from redis', username);
  res.json({ email: username });
}

function deleteToken(req: Request, res: Response) {
  res.status(NO_CONTENT).send();
}

function setupIdamStubController(): Router {
  const router: Router = Router();
  logger.info(`Idam stub enabled: ${enableStub}`);
  if (enableStub) {
    logger.info(`Using Idam stub`);
    redis = createRedisClient();
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    router.get('/idam-stub/login', getLogin);
    router.post('/idam-stub/login', postLogin);
    router.post('/idam-stub/oauth2/token', multipart.none(), getToken);
    router.get('/idam-stub/details', getDetails);
    router.delete('/idam-stub/session/:token', deleteToken);
  }
  return router;
}

export { setupIdamStubController };
