import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import * as AppInsights from '../app-insights';
import { Logger } from '@hmcts/nodejs-logging';
import { TrackYourApealService } from '../services/tyaService';
import { Dependencies } from '../routes';
import { Appeal } from '../models/express-session';
import HttpStatus from 'http-status-codes';

const logger = Logger.getLogger('av-evidence.js');
const contentType = new Map([
  ['audioDocument', 'audio/mp3'],
  ['videoDocument', 'video/mp4'],
]);

function getAppeal(req: Request): Appeal {
  const session = req.session;

  if (!session) {
    const missingCaseIdError = new Error(
      'Unable to retrieve session from session store'
    );
    AppInsights.trackException(missingCaseIdError);
    AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
  }

  return session.appeal;
}

function getAvEvidenceList(req: Request, res: Response) {
  const appeal = getAppeal(req);
  logger.info(
    `Number of audio video evidence: ${
      appeal.audioVideoEvidence ? appeal.audioVideoEvidence.length : 0
    }`
  );
  return res.render('av-evidence-tab.njk', { appeal });
}

function isValidEvidence(req: Request): boolean {
  return getAppeal(req).audioVideoEvidence.some(
    (avFile) => avFile.url === req.query.url
  );
}

function getAvEvidence(trackYourAppealService: TrackYourApealService) {
  return async (req: Request, res: Response) => {
    if (!isValidEvidence(req)) {
      const invalidEvidenceError = new Error(
        `Evidence with url ${req.query.url} is not associated with the appeal`
      );
      AppInsights.trackException(invalidEvidenceError);
      AppInsights.trackEvent('MYA_INVALID_EVIDENCE_URL');
      return res.status(HttpStatus.NOT_FOUND).send('Evidence not found');
    }

    const evidence = await trackYourAppealService.getMediaFile(
      req.query.url as string,
      req
    );
    res.header('content-type', contentType.get(req.query.type as string));
    res.send(Buffer.from(evidence, 'binary'));
  };
}

function setupAvEvidenceController(deps: Dependencies) {
  const router = Router();
  router.get(Paths.avEvidenceList, deps.prereqMiddleware, getAvEvidenceList);
  router.get(
    Paths.avEvidence,
    deps.prereqMiddleware,
    getAvEvidence(deps.trackYourApealService)
  );
  return router;
}

export { getAvEvidence, setupAvEvidenceController, getAvEvidenceList };
