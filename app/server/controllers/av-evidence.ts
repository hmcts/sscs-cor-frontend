import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';
import * as AppInsights from '../app-insights';
import { Logger } from '@hmcts/nodejs-logging';
import { TrackYourApealService } from '../services/tyaService';
import { dd_mm_yyyyFormat } from '../utils/dateUtils';

const logger = Logger.getLogger('av-evidence.js');
const contentType = new Map([
  ['audioDocument', 'audio/mp3'],
  ['videoDocument', 'video/mp4']
]);

function getAvEvidenceList(req: Request, res: Response) {
  const session = req.session;

  if (!session) {
    const missingCaseIdError = new Error('Unable to retrieve session from session store');
    AppInsights.trackException(missingCaseIdError);
    AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
  }

  let avEvidenceList = session['appeal'].audioVideoEvidence;
  logger.info(`Number of audio video evidence: ${avEvidenceList ? avEvidenceList.size : 0}`);
  return res.render('av-evidence-tab.html', { avEvidenceList });
}

function getAvEvidence(trackYourAppealService: TrackYourApealService) {
  return async (req: Request, res: Response) => {
    const evidence = await trackYourAppealService.getMediaFile(req.query.url as string, req);
    res.header('content-type', contentType.get(req.query.type as string));
    res.send(Buffer.from(evidence, 'binary'));
  };
}

function setupAvEvidenceController(deps: any) {
  const router = Router();
  router.get(Paths.avEvidenceList, deps.prereqMiddleware, getAvEvidenceList);
  router.get(Paths.avEvidence, deps.prereqMiddleware, getAvEvidence(deps.trackYourApealService));
  return router;
}

export {
  getAvEvidence,
  setupAvEvidenceController,
  getAvEvidenceList
};
